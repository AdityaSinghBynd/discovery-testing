// components/ConvertForm.js
import { useState } from "react";
import axios from "axios";

export default function ConvertForm() {
  const [tableHtml, setTableHtml] = useState("");
  const [sourceCurrency, setSourceCurrency] = useState("INR");
  const [sourceUnit, setSourceUnit] = useState("lakh");
  const [targetCurrency, setTargetCurrency] = useState("USD");
  const [targetUnit, setTargetUnit] = useState("thousand");
  const [convertedHtml, setConvertedHtml] = useState("");

  const handleConvert = async () => {
    try {
      const response = await axios.post("/api/convert", {
        tableHtml,
        sourceCurrency,
        sourceUnit,
        targetCurrency,
        targetUnit,
      });
      setConvertedHtml(response.data.convertedHtml);
    } catch (error) {
      console.error("Error converting:", error);
    }
  };

  return (
    <div>
      <div>
        <h3>Original Table</h3>
        <textarea
          value={tableHtml}
          onChange={(e) => setTableHtml(e.target.value)}
          placeholder="Paste your HTML table here"
        />
        {tableHtml && (
          <div>
            <h4>Preview</h4>
            <div dangerouslySetInnerHTML={{ __html: tableHtml }} />
          </div>
        )}
      </div>

      <div>
        <select
          value={sourceCurrency}
          onChange={(e) => setSourceCurrency(e.target.value)}
        >
          <option value="INR">INR</option>
          <option value="USD">USD</option>
          <option value="EUR">EUR</option>
          <option value="GBP">GBP</option>
        </select>
        <select
          value={sourceUnit}
          onChange={(e) => setSourceUnit(e.target.value)}
        >
          <option value="thousand">Thousand</option>
          <option value="lakh">Lakh</option>
          <option value="crore">Crore</option>
          <option value="million">Million</option>
          <option value="billion">Billion</option>
        </select>
        <span>to</span>
        <select
          value={targetCurrency}
          onChange={(e) => setTargetCurrency(e.target.value)}
        >
          <option value="USD">USD</option>
          <option value="INR">INR</option>
          <option value="EUR">EUR</option>
          <option value="GBP">GBP</option>
        </select>
        <select
          value={targetUnit}
          onChange={(e) => setTargetUnit(e.target.value)}
        >
          <option value="thousand">Thousand</option>
          <option value="lakh">Lakh</option>
          <option value="crore">Crore</option>
          <option value="million">Million</option>
          <option value="billion">Billion</option>
        </select>
        <button onClick={handleConvert}>Convert</button>
      </div>

      {convertedHtml && (
        <div>
          <h3>Converted Table</h3>
          <div dangerouslySetInnerHTML={{ __html: convertedHtml }} />
        </div>
      )}
    </div>
  );
}
