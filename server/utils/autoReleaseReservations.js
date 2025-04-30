const DonatedBook = require('../models/donatedBookModel');
const ReservedBook = require('../models/reservedBookModel');

async function autoReleaseReservations() {
  try {
    const expiredReservations = await ReservedBook.find({
      reservedUntil: { $lt: new Date() } // כל מי שהתפוגה שלו עברה
    });

    for (const reserved of expiredReservations) {
      // החזרת הספר ל-donatedBooks
      const returnedBook = new DonatedBook({
        userId: reserved.userId,
        bookTitle: reserved.bookTitle,
        author: reserved.author,
        grade: reserved.grade,
        barcode: reserved.barcode,
        condition: reserved.condition
      });

      await returnedBook.save();
      await reserved.deleteOne(); // מחיקה מהטבלת reservedBooks
    }

    if (expiredReservations.length > 0) {
      console.log(`✅ שוחררו ${expiredReservations.length} ספרים משמירה.`);
    }
  } catch (error) {
    console.error('❌ שגיאה בשחרור שריונות:', error);
  }
}

module.exports = autoReleaseReservations;
