// Firebase modular Web SDK. Uses CDN modules so this GitHub Pages site needs no build step.
// SDK version follows Firebase's current CDN guidance. See FIREBASE_SETUP.md.
import { initializeApp } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-app.js";
import { getFirestore, collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const PLACEHOLDER = "PASTE_";
const isConfigured = Object.values(firebaseConfig).every(value =>
  typeof value === "string" && value.length > 0 && !value.startsWith(PLACEHOLDER)
);

if (!isConfigured) {
  console.info("[Long Phung] Firebase chưa được cấu hình. Website tiếp tục sử dụng data.js.");
} else {
  try {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    window.longPhungFirebase = { app, db, configured: true };

    // Only published records are publicly listed. Firestore Rules also enforce this condition.
    const publishedQuery = query(
      collection(db, "documents"),
      where("status", "==", "published")
    );
    const snapshot = await getDocs(publishedQuery);
    const records = snapshot.docs.map(item => {
      const value = item.data();
      return {
        id: item.id,
        name: value.name || "",
        category: value.category || "",
        type: value.type || "Văn bản",
        description: value.description || "",
        file: value.downloadURL || value.file || "",
        fileName: value.fileName || "",
        legalStatus: value.legalStatus || "not_applicable",
        issueNumber: value.issueNumber || "",
        effectiveDate: value.effectiveDate || "",
        updatedAt: value.updatedAt || null
      };
    });
    window.libraryDocuments = records;
    window.dispatchEvent(new CustomEvent("library-data-updated", {
      detail: { documents: records, source: "firestore" }
    }));
    console.info("[Long Phung] Đã tải", records.length, "tài liệu từ Firestore.");
  } catch (error) {
    console.error("[Long Phung] Không tải được Firestore; tiếp tục dùng data.js.", error);
    window.dispatchEvent(new CustomEvent("firebase-load-error", {
      detail: { code: error?.code || "unknown", message: error?.message || "Không rõ lỗi" }
    }));
  }
}
