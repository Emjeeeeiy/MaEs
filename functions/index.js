const functions = require("firebase-functions");
const admin = require("firebase-admin");
const dayjs = require("dayjs");

admin.initializeApp();

const db = admin.firestore();

// Sync user role to custom claims
exports.onUserUpdate = functions.firestore
  .document("users/{userId}")
  .onWrite(async (change, context) => {
    const userId = context.params.userId;
    const data = change.after.exists ? change.after.data() : null;

    if (!data) {
      // User deleted: Clear custom claims
      try {
        await admin.auth().setCustomUserClaims(userId, null);
        console.log(`Cleared claims for deleted user ${userId}`);
      } catch (error) {
        console.error(`Error clearing claims for deleted user ${userId}:`, error);
      }
      return null;
    }

    const role = data.role || "user";
    const claims = {
      admin: role === "admin",
      role: role
    };

    // Optimization: Only update if role has changed or claims are not synced
    const oldData = change.before.exists ? change.before.data() : null;
    if (oldData && oldData.role === role && oldData.claimsSyncedAt) {
      return null;
    }

    try {
      await admin.auth().setCustomUserClaims(userId, claims);
      console.info(`Updated claims for user ${userId} to role: ${role}`);
      
      await change.after.ref.update({ 
        claimsSyncedAt: admin.firestore.FieldValue.serverTimestamp() 
      }, { merge: true });
    } catch (error) {
      console.error(`Failed to set claims for user ${userId}:`, error);
    }
    return null;
  });

// Simple scoring function
function scorePayment(payment) {
  // features
  const invoiceAmount = Number(payment.invoiceAmount || 0);
  const amountPaid = Number(payment.amountPaid || 0);
  const amountDiff = Math.abs(invoiceAmount - amountPaid);
  const ref = payment.gcashReferenceNumber || "";
  const submittedAt = payment.submittedAt ? dayjs(payment.submittedAt.toDate ? payment.submittedAt.toDate() : payment.submittedAt) : dayjs();
  const hour = submittedAt.hour();
  // heuristics weights (you can tune)
  let score = 0;
  const reasons = [];

  // 1) big difference between invoice and paid
  if (invoiceAmount > 0 && amountDiff / invoiceAmount > 0.05) { // >5%
    score += 0.5;
    reasons.push(`Amount mismatch: paid ${amountPaid} vs invoice ${invoiceAmount}`);
  }

  // 2) weird hour (e.g., 0-5 AM)
  if (hour <= 5 || hour >= 23) {
    score += 0.2;
    reasons.push(`Payment at unusual hour: ${hour}:00`);
  }

  // 3) missing reference number for GCash
  if ((payment.method || "").toLowerCase() === "gcash" && (!ref || ref.trim().length === 0)) {
    score += 0.4;
    reasons.push("Missing GCash reference number");
  }

  // clamp
  if (score > 1.0) score = 1.0;
  return { score, reasons, amountDiff };
}

exports.onPaymentCreate = functions.firestore
  .document("payments/{paymentId}")
  .onCreate(async (snap, ctx) => {
    const paymentId = ctx.params.paymentId;
    try {
      const payment = snap.data();
      const { score, reasons, amountDiff } = scorePayment(payment);

      // Check duplicate ref
      let duplicateRef = false;
      if (payment.gcashReferenceNumber) {
        const ref = payment.gcashReferenceNumber;
        const q = await db.collection("payments")
                        .where("gcashReferenceNumber", "==", ref)
                        .limit(2) // Optimization: only need to know if > 1
                        .get();
        
        if (q.size > 1) {
          duplicateRef = true;
          reasons.push(`Duplicate reference number detected: ${ref}`);
        }
      }

      let finalScore = score;
      if (duplicateRef) finalScore = Math.min(1, finalScore + 0.4);

      const flagged = finalScore >= 0.5;

      // Update payment doc with results
      // We store detailed reasons in a separate field that could be hidden via rules if needed
      await snap.ref.update({
        fraudLikelihood: finalScore,
        flagged: flagged,
        internalNotes: reasons.join("; "),
        amountDiff: amountDiff,
        evaluatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      if (flagged) {
        console.warn(`High fraud risk (${finalScore}) for payment ${paymentId}: ${reasons.join(", ")}`);
        await db.collection("notifications").add({
          type: "fraud_alert",
          paymentId,
          message: `Action Required: High fraud risk detected for payment ${paymentId}`,
          severity: "high",
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          read: false
        });
      }

      return null;
    } catch (err) {
      console.error(`Error processing payment ${paymentId}:`, err);
      // Ensure the document is at least marked as evaluated even if scoring fails
      try {
        await snap.ref.update({ evaluationError: true });
      } catch (e) {
        console.error("Critical failure updating payment doc:", e);
      }
      return null;
    }
  });
