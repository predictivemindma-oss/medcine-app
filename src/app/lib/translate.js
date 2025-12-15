export async function translateToArabic(text, gender = "f") {
  if (!text || typeof text !== "string" || !text.trim()) return "";

  try {
    // ENLEVER "Dr" et "Docteur" avant la traduction
    let textToTranslate = text
      .replace(/\b(Dr\.|Docteur|DR\.|dr\.)\s+/gi, '')
      .replace(/\ble docteur\s+/gi, '')
      .replace(/\bla docteure\s+/gi, '');

    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=fr&tl=ar&dt=t&q=${encodeURIComponent(
      textToTranslate
    )}`;

    const res = await fetch(url);
    const data = await res.json();

    const translated = data[0]?.map(item => item[0]).join("") || text;

    return translated;
  } catch (err) {
    console.error("Erreur traduction Google:", err.message);
    return text;
  }
}

