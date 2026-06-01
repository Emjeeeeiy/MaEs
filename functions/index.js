const functions = require("firebase-functions");
const admin = require("firebase-admin");
const dayjs = require("dayjs");

admin.initializeApp();

const db = admin.firestore();

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

  // 2) duplicate reference number (we'll check separately)
  // placeholder: handled async in trigger

  // 3) weird hour (e.g., 0-5 AM)
  if (hour <= 5 || hour >= 23) {
    score += 0.2;
    reasons.push(`Payment at unusual hour: ${hour}:00`);
  }

  // 4) missing reference number for GCash
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
    try {
      const payment = snap.data();
      const paymentId = ctx.params.paymentId;
      const { score, reasons, amountDiff } = scorePayment(payment);

      // check duplicate ref
      let duplicateRef = false;
      if (payment.gcashReferenceNumber) {
        const ref = payment.gcashReferenceNumber;
        const q = await db.collection("payments")
                        .where("gcashReferenceNumber","==",ref)
                        .get();
        // if more than 1 -> duplicate
        if (q.size > 1) {
          duplicateRef = true;
          reasons.push(`Duplicate ref (${ref}) seen ${q.size} times`);
          // increase score
          // if already high because of mismatch, add less; else add more
        }
      }

      let finalScore = score;
      if (duplicateRef) finalScore = Math.min(1, finalScore + 0.4);

      // flag threshold (tweak as needed)
      const flagged = finalScore >= 0.5;

      // update payment doc
      await snap.ref.update({
        fraudLikelihood: finalScore,
        flagged: flagged,
        fraudReasons: reasons,
        amountDiff: amountDiff,
        evaluatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // create notification for admin (optional)
      if (flagged) {
        await db.collection("notifications").add({
          type: "fraud_alert",
          paymentId,
          message: `High fraud risk detected for payment ${paymentId}`,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          read: false
        });
      }

      return null;
    } catch (err) {
      console.error("onPaymentCreate error", err);
      return null;
    }
  });
