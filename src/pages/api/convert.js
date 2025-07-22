// pages/api/convert.js
import convertHtmlUnits from "../../utils/unit/convertHtmlUnits";

export default function handler(req, res) {
  if (req.method === "POST") {
    const {
      tableHtml,
      sourceCurrency,
      sourceUnit,
      targetCurrency,
      targetUnit,
      decimals,
    } = req.body;

    if (
      !tableHtml ||
      !sourceCurrency ||
      !sourceUnit ||
      !targetCurrency ||
      !targetUnit
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      const convertedHtml = convertHtmlUnits(
        tableHtml,
        sourceCurrency,
        sourceUnit,
        targetCurrency,
        targetUnit,
        decimals,
      );
      return res.status(200).json({ convertedHtml });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
}
