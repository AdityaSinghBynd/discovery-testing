import React, { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody } from "@/components/ui/table";
import { FileSpreadsheet, X } from "lucide-react";
import HTMLToShadcnTable from "@/components/Html/Table";
import type { RawFinancialData, FinancialData } from "./types";
import { formatFinancialData } from "./example";
import { formatStatementName, getStatementCategory } from "./format";
import extractedTableStyles from "@/styles/ExtractedTableStyles.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { fetchFinancialData } from "@/redux/FinancialStatements/financialStatements.thunks";
import { AppDispatch, RootState } from "@/store/store";

interface FinancialDataType {
  data: {
    [key: string]: string[];
  };
}

// const jsonData: RawFinancialData = {
//     message: "PDF processed successfully",
//     "data": {
//         "standalone balance sheet": [
//             "<table>\n<tr>\n<th>Particulars</th>\n<th>Note</th>\n<th>As at March 31, 2024</th>\n<th>As at March 31, 2023</th>\n</tr>\n<tr>\n<td>ASSETS</td>\n<td></td>\n<td></td>\n<td></td>\n</tr>\n<tr>\n<td>Non-current assets</td>\n<td></td>\n<td></td>\n<td></td>\n</tr>\n<tr>\n<td>(a) Property, plant and equipment</td>\n<td>5</td>\n<td>47,096</td>\n<td>45,211</td>\n</tr>\n<tr>\n<td>(b) Right-of-Use Assets</td>\n<td>6</td>\n<td>12,612</td>\n<td>5,283</td>\n</tr>\n<tr>\n<td>(c) Capital work-in-progress</td>\n<td>5.1</td>\n<td>1,725</td>\n<td>890</td>\n</tr>\n<tr>\n<td>(d) Other Intangible assets</td>\n<td>7</td>\n<td>608</td>\n<td>286</td>\n</tr>\n<tr>\n<td>(e) Intangible assets under development</td>\n<td>7.1</td>\n<td>272</td>\n<td>74</td>\n</tr>\n<tr>\n<td>(f) Financial Assets</td>\n<td></td>\n<td></td>\n<td></td>\n</tr>\n<tr>\n<td>(i) Investments</td>\n<td>8</td>\n<td>19,377</td>\n<td>19,256</td>\n</tr>\n<tr>\n<td>(ii) Loans</td>\n<td>9</td>\n<td>2,446</td>\n<td>2,356</td>\n</tr>\n<tr>\n<td>(iii) Other financial assets</td>\n<td>12</td>\n<td>1,789</td>\n<td>1,314</td>\n</tr>\n<tr>\n<td>(g) Income Tax Asset (Net)</td>\n<td>25</td>\n<td>729</td>\n<td>645</td>\n</tr>\n<tr>\n<td>(h) Other non-current assets</td>\n<td>16</td>\n<td>647</td>\n<td>982</td>\n</tr>\n<tr>\n<td>Total Non - Current Assets</td>\n<td></td>\n<td>87,301</td>\n<td>76,297</td>\n</tr>\n<tr>\n<td>Current assets</td>\n<td></td>\n<td></td>\n<td></td>\n</tr>\n<tr>\n<td>(a) Inventories</td>\n<td>13</td>\n<td>1,187</td>\n<td>983</td>\n</tr>\n<tr>\n<td>(b) Financial assets</td>\n<td></td>\n<td></td>\n<td></td>\n</tr>\n<tr>\n<td>(i) Investments</td>\n<td>8</td>\n<td>6,835</td>\n<td>2,916</td>\n</tr>\n<tr>\n<td>(ii) Trade receivables</td>\n<td>11</td>\n<td>8,083</td>\n<td>8,200</td>\n</tr>\n<tr>\n<td>(iii) Cash and cash equivalents</td>\n<td>14</td>\n<td>2,761</td>\n<td>2,170</td>\n</tr>\n<tr>\n<td>(iv) Bank balances other than (iii) above</td>\n<td>15</td>\n<td>661</td>\n<td>1,010</td>\n</tr>\n<tr>\n<td>(v) Loans</td>\n<td>10</td>\n<td>791</td>\n<td>803</td>\n</tr>\n<tr>\n<td>(vi) Other financial assets</td>\n<td>12</td>\n<td>13,673</td>\n<td>13,099</td>\n</tr>\n<tr>\n<td>(c) Contract assets</td>\n<td>12.3</td>\n<td>878</td>\n<td>857</td>\n</tr>\n<tr>\n<td>(d) Other current assets</td>\n<td>16</td>\n<td>1,882</td>\n<td>1,469</td>\n</tr>\n<tr>\n<td>Total Current Assets</td>\n<td></td>\n<td>36,751</td>\n<td>31,507</td>\n</tr>\n<tr>\n<td>Total Assets</td>\n<td></td>\n<td>1,24,052</td>\n<td>1,07,804</td>\n</tr>\n<tr>\n<td>EQUITY AND LIABILITIES</td>\n<td></td>\n<td></td>\n<td></td>\n</tr>\n<tr>\n<td>Equity</td>\n<td></td>\n<td></td>\n<td></td>\n</tr>\n<tr>\n<td>(a) Equity Share capital</td>\n<td>17</td>\n<td>719</td>\n<td>719</td>\n</tr>\n<tr>\n<td>(b) Other equity</td>\n<td>18</td>\n<td>76,390</td>\n<td>68,529</td>\n</tr>\n<tr>\n<td>Total Equity</td>\n<td></td>\n<td>77,109</td>\n<td>69,248</td>\n</tr>\n<tr>\n<td>Liabilities</td>\n<td></td>\n<td></td>\n<td></td>\n</tr>\n<tr>\n<td>Non-current liabilities</td>\n<td></td>\n<td></td>\n<td></td>\n</tr>\n<tr>\n<td>(a) Financial Liabilities</td>\n<td></td>\n<td></td>\n<td></td>\n</tr>\n<tr>\n<td>(i) Borrowings</td>\n<td>19</td>\n<td>17,855</td>\n<td>15,201</td>\n</tr>\n<tr>\n<td>(ii) Lease liabilities</td>\n<td>21</td>\n<td>11,563</td>\n<td>6,993</td>\n</tr>\n<tr>\n<td>(iii) Other financial liabilities</td>\n<td>20</td>\n<td>23</td>\n<td>52</td>\n</tr>\n<tr>\n<td>(b) Deferred tax liabilities (Net)</td>\n<td>23</td>\n<td>3,764</td>\n<td>3,828</td>\n</tr>\n<tr>\n<td>(c) Other non-current liabilities</td>\n<td>26</td>\n<td>36</td>\n<td>49</td>\n</tr>\n<tr>\n<td>Total Non - Current Liabilities</td>\n<td></td>\n<td>33,241</td>\n<td>26,123</td>\n</tr>\n<tr>\n<td>Current liabilities</td>\n<td></td>\n<td></td>\n<td></td>\n</tr>\n<tr>\n<td>(a) Financial Liabilities</td>\n<td></td>\n<td></td>\n<td></td>\n</tr>\n<tr>\n<td>(i) Borrowings</td>\n<td>19</td>\n<td>1,702</td>\n<td>2,405</td>\n</tr>\n<tr>\n<td>(ii) Lease liabilities</td>\n<td>21</td>\n<td>1,098</td>\n<td>606</td>\n</tr>\n<tr>\n<td>(iii) Trade payables</td>\n<td>24</td>\n<td></td>\n<td></td>\n</tr>\n<tr>\n<td>(a) total outstanding dues of micro enterprises and small enterprises</td>\n<td></td>\n<td>586</td>\n<td>407</td>\n</tr>\n<tr>\n<td>(b) total outstanding dues of creditors other than micro enterprises and small enterprises</td>\n<td></td>\n<td>6,989</td>\n<td>5,922</td>\n</tr>\n<tr>\n<td>(iv) Other financial liabilities</td>\n<td>20</td>\n<td>1,236</td>\n<td>1,280</td>\n</tr>\n<tr>\n<td>(b) Other current liabilities</td>\n<td>26</td>\n<td>1,078</td>\n<td>1,042</td>\n</tr>\n<tr>\n<td>(c) Provisions</td>\n<td>22</td>\n<td>1,013</td>\n<td>771</td>\n</tr>\n<tr>\n<td>Total Current Liabilities</td>\n<td></td>\n<td>13,702</td>\n<td>12,433</td>\n</tr>\n<tr>\n<td>Total Liabilities</td>\n<td></td>\n<td>46,943</td>\n<td>38,556</td>\n</tr>\n<tr>\n<td>Total Equity and Liabilities</td>\n<td></td>\n<td>1,24,052</td>\n<td>1,07,804</td>\n</tr>\n</table>"
//         ],
//         "standalone profit & loss statement": [
//             "<table>\n<tr>\n<th>Particulars</th>\n<th>Note</th>\n<th>Year ended March 31, 2024</th>\n<th>Year ended March 31, 2023</th>\n</tr>\n<tr>\n<td>Income</td>\n<td></td>\n<td></td>\n<td></td>\n</tr>\n<tr>\n<td>Revenue from Operations</td>\n<td>27</td>\n<td>72,738</td>\n<td>65,248</td>\n</tr>\n<tr>\n<td>Other Income</td>\n<td>28</td>\n<td>1,799</td>\n<td>1,515</td>\n</tr>\n<tr>\n<td>Total Income</td>\n<td></td>\n<td>74,537</td>\n<td>66,763</td>\n</tr>\n<tr>\n<td>Expenses</td>\n<td></td>\n<td></td>\n<td></td>\n</tr>\n<tr>\n<td>Cost of materials consumed</td>\n<td>29</td>\n<td>19,990</td>\n<td>18,611</td>\n</tr>\n<tr>\n<td>Employee benefits expense</td>\n<td>30</td>\n<td>14,252</td>\n<td>12,723</td>\n</tr>\n<tr>\n<td>Finance costs</td>\n<td>31</td>\n<td>2,498</td>\n<td>2,388</td>\n</tr>\n<tr>\n<td>Depreciation and amortisation expenses</td>\n<td>32</td>\n<td>3,990</td>\n<td>3,667</td>\n</tr>\n<tr>\n<td>Other expenses</td>\n<td>33</td>\n<td>20,521</td>\n<td>17,099</td>\n</tr>\n<tr>\n<td>Total expenses</td>\n<td></td>\n<td>61,251</td>\n<td>54,488</td>\n</tr>\n<tr>\n<td>Profit before tax</td>\n<td></td>\n<td>13,286</td>\n<td>12,275</td>\n</tr>\n<tr>\n<td>Tax expense/(benefit)</td>\n<td></td>\n<td></td>\n<td></td>\n</tr>\n<tr>\n<td>(1) Current tax</td>\n<td></td>\n<td></td>\n<td></td>\n</tr>\n<tr>\n<td>- Current year</td>\n<td>34</td>\n<td>3,193</td>\n<td>2,959</td>\n</tr>\n<tr>\n<td>- Adjustment in respect of prior year</td>\n<td>34</td>\n<td>23</td>\n<td>66</td>\n</tr>\n<tr>\n<td>(2) Deferred tax</td>\n<td>34</td>\n<td>(35)</td>\n<td>(1,598)</td>\n</tr>\n<tr>\n<td></td>\n<td></td>\n<td>3,181</td>\n<td>1,427</td>\n</tr>\n<tr>\n<td>Profit for the year</td>\n<td></td>\n<td>10,105</td>\n<td>10,848</td>\n</tr>\n<tr>\n<td>Other Comprehensive Income/(loss)</td>\n<td></td>\n<td></td>\n<td></td>\n</tr>\n<tr>\n<td>Items that will not be reclassified to profit or loss and their related income tax effects:</td>\n<td></td>\n<td></td>\n<td></td>\n</tr>\n<tr>\n<td>Re-measurements of the defined benefit plans</td>\n<td>35</td>\n<td>(114)</td>\n<td>(149)</td>\n</tr>\n<tr>\n<td>Income tax relating to items that will not be reclassified to profit or loss</td>\n<td>35</td>\n<td>29</td>\n<td>38</td>\n</tr>\n<tr>\n<td>Total Other Comprehensive Income/(loss) for the year</td>\n<td></td>\n<td>(85)</td>\n<td>(111)</td>\n</tr>\n<tr>\n<td>Total comprehensive income for the year</td>\n<td></td>\n<td>10,020</td>\n<td>10,737</td>\n</tr>\n<tr>\n<td>Earnings per equity share of par value of ₹ 5 each</td>\n<td></td>\n<td></td>\n<td></td>\n</tr>\n<tr>\n<td>Basic (in ₹)</td>\n<td>37</td>\n<td>70.28</td>\n<td>75.45</td>\n</tr>\n<tr>\n<td>Diluted (in ₹)</td>\n<td>37</td>\n<td>70.28</td>\n<td>75.45</td>\n</tr>\n</table>"
//         ],
//         "standalone cash flow statement": [
//             "<table>\n<tr>\n<th>Particulars</th>\n<th>Year ended March 31, 2024</th>\n<th>Year ended March 31, 2023</th>\n</tr>\n<tr>\n<td>Cash flow from Operating Activities</td>\n<td></td>\n<td></td>\n</tr>\n<tr>\n<td>Profit for the year</td>\n<td>10,105</td>\n<td>10,848</td>\n</tr>\n<tr>\n<td>Adjustments for:</td>\n<td></td>\n<td></td>\n</tr>\n<tr>\n<td>Depreciation and amortisation expenses</td>\n<td>3,990</td>\n<td>3,667</td>\n</tr>\n<tr>\n<td>Income Tax expense</td>\n<td>3,181</td>\n<td>1,427</td>\n</tr>\n<tr>\n<td>(Profit)/loss on Sale of Property Plant &amp; Equipment</td>\n<td>(14)</td>\n<td>125</td>\n</tr>\n<tr>\n<td>Profit on Sale of Investments (Net)</td>\n<td>(90)</td>\n<td>(157)</td>\n</tr>\n<tr>\n<td>Finance costs</td>\n<td>2,498</td>\n<td>2,388</td>\n</tr>\n<tr>\n<td>Interest from Banks/others</td>\n<td>(367)</td>\n<td>(414)</td>\n</tr>\n<tr>\n<td>Dividend on non-current equity investments</td>\n<td>(1,018)</td>\n<td>(608)</td>\n</tr>\n<tr>\n<td>Expected Credit Loss on trade receivables</td>\n<td>354</td>\n<td>218</td>\n</tr>\n<tr>\n<td>Provision written back</td>\n<td>(2)</td>\n<td>(5)</td>\n</tr>\n<tr>\n<td>Gain on fair valuation of mutual funds</td>\n<td>(284)</td>\n<td>(128)</td>\n</tr>\n<tr>\n<td>Gain of fair valuation of equity investments</td>\n<td>(6)</td>\n<td>(5)</td>\n</tr>\n<tr>\n<td>Unrealised foreign exchange (gain)/ loss (net)</td>\n<td>1</td>\n<td>(2)</td>\n</tr>\n<tr>\n<td>Gain on sub-lease</td>\n<td>-</td>\n<td>(149)</td>\n</tr>\n<tr>\n<td>Operating Profit before working capital changes</td>\n<td>18,348</td>\n<td>17,205</td>\n</tr>\n<tr>\n<td>Adjustments for (increase)/decrease in operating assets</td>\n<td></td>\n<td></td>\n</tr>\n<tr>\n<td>Inventories</td>\n<td>(204)</td>\n<td>485</td>\n</tr>\n<tr>\n<td>Trade receivables</td>\n<td>(238)</td>\n<td>(174)</td>\n</tr>\n<tr>\n<td>Other financial assets - Non current</td>\n<td>(3,141)</td>\n<td>(41)</td>\n</tr>\n<tr>\n<td>Other financial assets - Current</td>\n<td>(448)</td>\n<td>(575)</td>\n</tr>\n<tr>\n<td>Other non-current assets</td>\n<td>149</td>\n<td>(265)</td>\n</tr>\n<tr>\n<td>Other current assets</td>\n<td>(413)</td>\n<td>(376)</td>\n</tr>\n<tr>\n<td></td>\n<td>(4,295)</td>\n<td>(946)</td>\n</tr>\n<tr>\n<td>Adjustments for increase/(decrease) in operating liabilities</td>\n<td></td>\n<td></td>\n</tr>\n<tr>\n<td>Trade payables</td>\n<td>1,245</td>\n<td>(201)</td>\n</tr>\n<tr>\n<td>Other financial liabilities - Non current</td>\n<td>(29)</td>\n<td>(3)</td>\n</tr>\n<tr>\n<td>Other financial liabilities - Current</td>\n<td>(206)</td>\n<td>(607)</td>\n</tr>\n<tr>\n<td>Provisions</td>\n<td>129</td>\n<td>(44)</td>\n</tr>\n<tr>\n<td>Other non-current liabilities</td>\n<td>(14)</td>\n<td>50</td>\n</tr>\n<tr>\n<td>Other current liabilities</td>\n<td>36</td>\n<td>25</td>\n</tr>\n<tr>\n<td></td>\n<td>1,161</td>\n<td>(780)</td>\n</tr>\n<tr>\n<td>Cash generated from operations</td>\n<td>15,214</td>\n<td>15,479</td>\n</tr>\n<tr>\n<td>Net income tax paid</td>\n<td>(3,300)</td>\n<td>(3,234)</td>\n</tr>\n<tr>\n<td>Net cash generated from operating activities (A)</td>\n<td>11,914</td>\n<td>12,246</td>\n</tr>\n<tr>\n<td>Cash flow from Investing Activities</td>\n<td></td>\n<td></td>\n</tr>\n<tr>\n<td>Purchase of Property Plant &amp; Equipment, CWIP &amp; Intangibles</td>\n<td>(6,210)</td>\n<td>(3,960)</td>\n</tr>\n<tr>\n<td>Proceeds from sale of Property plant &amp; equipment</td>\n<td>11</td>\n<td>23</td>\n</tr>\n<tr>\n<td>Proceeds from sale of business to a subsidiary (Refer Note 51.1)</td>\n<td>-</td>\n<td>331</td>\n</tr>\n<tr>\n<td>Purchase of Non-current Investments</td>\n<td>(143)</td>\n<td>(3,803)</td>\n</tr>\n</table>"
//         ],
//         "consolidated balance sheet": [
//             "<table>\n<tr>\n<th>Particulars</th>\n<th>Note</th>\n<th>As at March 31, 2024</th>\n<th>As at March 31, 2023</th>\n</tr>\n<tr>\n<td>ASSETS</td>\n<td></td>\n<td></td>\n<td></td>\n</tr>\n<tr>\n<td>Non-current assets</td>\n<td></td>\n<td></td>\n<td></td>\n</tr>\n<tr>\n<td>(a) Property, Plant and Equipment</td>\n<td>5</td>\n<td>65,662</td>\n<td>62,004</td>\n</tr>\n<tr>\n<td>(b) Right-of-use assets</td>\n<td>6</td>\n<td>19,743</td>\n<td>12,317</td>\n</tr>\n<tr>\n<td>(c) Capital work-in-progress</td>\n<td>5.1</td>\n<td>8,447</td>\n<td>6,017</td>\n</tr>\n<tr>\n<td>(d) Investment Property</td>\n<td>7</td>\n<td>34</td>\n<td>41</td>\n</tr>\n<tr>\n<td>(e) Goodwill</td>\n<td>8</td>\n<td>10,123</td>\n<td>9,858</td>\n</tr>\n<tr>\n<td>(f) Other Intangible assets</td>\n<td>9</td>\n<td>1,077</td>\n<td>978</td>\n</tr>\n<tr>\n<td>(g) Intangible assets under development</td>\n<td>9.1</td>\n<td>281</td>\n<td>82</td>\n</tr>\n<tr>\n<td>(h) Financial Assets</td>\n<td></td>\n<td></td>\n<td></td>\n</tr>\n<tr>\n<td>(i) Investments accounted for using the equity method</td>\n<td>10</td>\n<td>1,984</td>\n<td>1,857</td>\n</tr>\n<tr>\n<td>(ii) Other Investments</td>\n<td>11</td>\n<td>1,037</td>\n<td>957</td>\n</tr>\n<tr>\n<td>(iii) Loans</td>\n<td>12</td>\n<td>66</td>\n<td>84</td>\n</tr>\n<tr>\n<td>(iv) Other financial assets</td>\n<td>14</td>\n<td>2,525</td>\n<td>2,968</td>\n</tr>\n<tr>\n<td>(i) Deferred Tax Asset</td>\n<td>26</td>\n<td>109</td>\n<td>121</td>\n</tr>\n<tr>\n<td>(i) Income Tax Asset (Net)</td>\n<td>28</td>\n<td>2,424</td>\n<td>2,095</td>\n</tr>\n<tr>\n<td>(k) Other non-current assets ☒</td>\n<td>18</td>\n<td>1,222</td>\n<td>1,529</td>\n</tr>\n<tr>\n<td>Total Non - Current Assets</td>\n<td></td>\n<td>1,14,734</td>\n<td>1,00,908</td>\n</tr>\n<tr>\n<td>Current assets</td>\n<td></td>\n<td></td>\n<td></td>\n</tr>\n<tr>\n<td>(a) Inventories</td>\n<td>15</td>\n<td>4,598</td>\n<td>3,901</td>\n</tr>\n<tr>\n<td>(b) Financial assets</td>\n<td></td>\n<td></td>\n<td></td>\n</tr>\n<tr>\n<td>(i) Investments</td>\n<td>11</td>\n<td>6,840</td>\n<td>2,922</td>\n</tr>\n<tr>\n<td>(ii) Trade receivables</td>\n<td>13</td>\n<td>25,149</td>\n<td>22,342</td>\n</tr>\n<tr>\n<td>(iii) Cash and cash equivalents</td>\n<td>16</td>\n<td>5,055</td>\n<td>4,334</td>\n</tr>\n<tr>\n<td>(iv) Bank balances other than (iii) above</td>\n<td>17</td>\n<td>4,283</td>\n<td>3,424</td>\n</tr>\n<tr>\n<td>(v) Loans</td>\n<td>12</td>\n<td>49</td>\n<td>56</td>\n</tr>\n<tr>\n<td>(vi) Other financial assets</td>\n<td>14</td>\n<td>1,659</td>\n<td>1,462</td>\n</tr>\n<tr>\n<td>(c) Contract assets</td>\n<td>13.3</td>\n<td>1,459</td>\n<td>1,477</td>\n</tr>\n<tr>\n<td>(d) Other current assets</td>\n<td>18</td>\n<td>3,705</td>\n<td>3,452</td>\n</tr>\n<tr>\n<td>Total Current Assets</td>\n<td></td>\n<td>52,797</td>\n<td>43,370</td>\n</tr>\n<tr>\n<td>Total Assets</td>\n<td></td>\n<td>1,67,531</td>\n<td>1,44,278</td>\n</tr>\n<tr>\n<td>EQUITY AND LIABILITIES</td>\n<td></td>\n<td></td>\n<td></td>\n</tr>\n<tr>\n<td>Equity</td>\n<td></td>\n<td></td>\n<td></td>\n</tr>\n<tr>\n<td>(a) Equity Share capital</td>\n<td>19</td>\n<td>719</td>\n<td>719</td>\n</tr>\n<tr>\n<td>(b) Other equity</td>\n<td>20</td>\n<td>68,635</td>\n<td>61,255</td>\n</tr>\n<tr>\n<td>Equity attributable to owners of the Company</td>\n<td></td>\n<td>69,354</td>\n<td>61,974</td>\n</tr>\n<tr>\n<td>Non-Controlling Interest</td>\n<td>21</td>\n<td>3,851</td>\n<td>3,339</td>\n</tr>\n<tr>\n<td>Total Equity</td>\n<td></td>\n<td>73,205</td>\n<td>65,313</td>\n</tr>\n<tr>\n<td>Liabilities</td>\n<td></td>\n<td></td>\n<td></td>\n</tr>\n<tr>\n<td>Non-current liabilities</td>\n<td></td>\n<td></td>\n<td></td>\n</tr>\n<tr>\n<td>(a) Financial Liabilities</td>\n<td></td>\n<td></td>\n<td></td>\n</tr>\n<tr>\n<td>(i) Borrowings</td>\n<td>22</td>\n<td>22,356</td>\n<td>19,376</td>\n</tr>\n<tr>\n<td>(ii) Lease liabilities</td>\n<td>23</td>\n<td>19,814</td>\n<td>14,983</td>\n</tr>\n<tr>\n<td>(iii) Other financial liabilities</td>\n<td>24</td>\n<td>103</td>\n<td>6,162</td>\n</tr>\n<tr>\n<td>(b) Provisions</td>\n<td>25</td>\n<td>732</td>\n<td>574</td>\n</tr>\n<tr>\n<td>(c) Deferred tax liabilities (Net)</td>\n<td>26</td>\n<td>4,498</td>\n<td>4,424</td>\n</tr>\n<tr>\n<td>(d) Other non-current liabilities</td>\n<td>30</td>\n<td>178</td>\n<td>197</td>\n</tr>\n<tr>\n<td>Total Non - Current Liabilities</td>\n<td></td>\n<td>47,681</td>\n<td>45,716</td>\n</tr>\n<tr>\n<td>Current liabilities</td>\n<td></td>\n<td></td>\n<td></td>\n</tr>\n<tr>\n<td>(a) Financial Liabilities</td>\n<td></td>\n<td></td>\n<td></td>\n</tr>\n<tr>\n<td>(i) Borrowings</td>\n<td>22</td>\n<td>9,263</td>\n<td>7,727</td>\n</tr>\n<tr>\n<td>(ii) Lease liabilities</td>\n<td>23</td>\n<td>1,893</td>\n<td>1,238</td>\n</tr>\n<tr>\n<td>(iii) Trade payables</td>\n<td>27</td>\n<td></td>\n<td></td>\n</tr>\n<tr>\n<td>(a) total outstanding dues of micro enterprises and small enterprises</td>\n<td></td>\n<td>848</td>\n<td>537</td>\n</tr>\n<tr>\n<td>(b) total outstanding dues of creditors other than micro enterprises and small enterprises</td>\n<td></td>\n<td>22,838</td>\n<td>18,619</td>\n</tr>\n<tr>\n<td>(iv) Other financial liabilities</td>\n<td>24</td>\n<td>7,987</td>\n<td>1,596</td>\n</tr>\n<tr>\n<td>(b) Other current liabilities</td>\n<td>30</td>\n<td>2,369</td>\n<td>2,378</td>\n</tr>\n<tr>\n<td>(c) Provisions</td>\n<td>25</td>\n<td>1,434</td>\n<td>1,126</td>\n</tr>\n<tr>\n<td>(d) Current Tax Liabilities (Net)</td>\n<td>29</td>\n<td>13</td>\n<td>28</td>\n</tr>\n<tr>\n<td>Total Current Liabilities</td>\n<td></td>\n<td>46,645</td>\n<td>33,249</td>\n</tr>\n<tr>\n<td>Total Liabilities</td>\n<td></td>\n<td>94,326</td>\n<td>78,965</td>\n</tr>\n<tr>\n<td>Total Equity and Liabilities</td>\n<td></td>\n<td>1,67,531</td>\n<td>1,44,278</td>\n</tr>\n</table>"
//         ],
//         "consolidated profit & loss statement": [
//             "<table>\n<tr>\n<th>Particulars</th>\n<th>Note</th>\n<th>Year ended March 31, 2024</th>\n<th>Year ended March 31, 2023</th>\n</tr>\n<tr>\n<td>Income</td>\n<td></td>\n<td></td>\n<td></td>\n</tr>\n<tr>\n<td>Revenue from Operations</td>\n<td>31</td>\n<td>1,90,592</td>\n<td>1,66,125</td>\n</tr>\n<tr>\n<td>Other Income</td>\n<td>32</td>\n<td>1,063</td>\n<td>903</td>\n</tr>\n<tr>\n<td>Total Income</td>\n<td></td>\n<td>1,91,655</td>\n<td>1,67,028</td>\n</tr>\n<tr>\n<td>Expenses</td>\n<td></td>\n<td></td>\n<td></td>\n</tr>\n<tr>\n<td>Cost of materials consumed</td>\n<td>33</td>\n<td>24,541</td>\n<td>22,838</td>\n</tr>\n<tr>\n<td>Purchases of Stock-in-trade</td>\n<td></td>\n<td>73,849</td>\n<td>63,150</td>\n</tr>\n<tr>\n<td>Changes in inventories of stock-in-trade</td>\n<td>34</td>\n<td>(335)</td>\n<td>(245)</td>\n</tr>\n<tr>\n<td>Employee benefits expense</td>\n<td>35</td>\n<td>24,937</td>\n<td>21,767</td>\n</tr>\n<tr>\n<td>Finance costs</td>\n<td>36</td>\n<td>4,494</td>\n<td>3,808</td>\n</tr>\n<tr>\n<td>Depreciation and amortisation expense</td>\n<td>37</td>\n<td>6,870</td>\n<td>6,154</td>\n</tr>\n<tr>\n<td>Other expenses</td>\n<td>38</td>\n<td>43,693</td>\n<td>38,119</td>\n</tr>\n<tr>\n<td>Total expenses</td>\n<td></td>\n<td>1,78,049</td>\n<td>1,55,591</td>\n</tr>\n<tr>\n<td>Profit before exceptional items, share of net profits of investments accounted for using equity method and tax</td>\n<td></td>\n<td>13,606</td>\n<td>11,437</td>\n</tr>\n<tr>\n<td>Exceptional Items (Refer note 63)</td>\n<td></td>\n<td>19</td>\n<td>-</td>\n</tr>\n<tr>\n<td>Profit before share of net profits of investments accounted for using equity method and tax</td>\n<td></td>\n<td>13,625</td>\n<td>11,437</td>\n</tr>\n<tr>\n<td>Tax expense</td>\n<td></td>\n<td></td>\n<td></td>\n</tr>\n<tr>\n<td>(1) Current tax</td>\n<td>39</td>\n<td></td>\n<td></td>\n</tr>\n<tr>\n<td>- Current year</td>\n<td></td>\n<td>4,345</td>\n<td>3,993</td>\n</tr>\n<tr>\n<td>- Adjustment in respect of prior year</td>\n<td></td>\n<td>23</td>\n<td>66</td>\n</tr>\n<tr>\n<td>(2) Deferred tax</td>\n<td>39</td>\n<td>87</td>\n<td>(1,497)</td>\n</tr>\n<tr>\n<td>Total tax expenses</td>\n<td></td>\n<td>4,455</td>\n<td>2,562</td>\n</tr>\n<tr>\n<td>Profit after tax</td>\n<td></td>\n<td>9,170</td>\n<td>8,875</td>\n</tr>\n<tr>\n<td>Share of net profit of associates and joint ventures accounted for using the equity method</td>\n<td></td>\n<td>180</td>\n<td>(432)</td>\n</tr>\n<tr>\n<td>Profit for the year</td>\n<td></td>\n<td>9,350</td>\n<td>8,443</td>\n</tr>\n<tr>\n<td>Other Comprehensive Income/(loss)</td>\n<td></td>\n<td></td>\n<td></td>\n</tr>\n<tr>\n<td>Items that will not be reclassified to profit or loss</td>\n<td></td>\n<td></td>\n<td></td>\n</tr>\n<tr>\n<td>(a) Remeasurement of the defined benefit plans</td>\n<td>41</td>\n<td>(142)</td>\n<td>(207)</td>\n</tr>\n<tr>\n<td>(b) Exchange differences in translating the financial statements of foreign operations</td>\n<td>41</td>\n<td>2</td>\n<td>22</td>\n</tr>\n<tr>\n<td>(c) Income tax relating to items that will not be reclassified to profit or loss</td>\n<td>41</td>\n<td>36</td>\n<td>52</td>\n</tr>\n<tr>\n<td>Total Other Comprehensive Income/(loss)</td>\n<td></td>\n<td>(104)</td>\n<td>(133)</td>\n</tr>\n<tr>\n<td>Total Comprehensive Income for the Year</td>\n<td></td>\n<td>9,246</td>\n<td>8,310</td>\n</tr>\n<tr>\n<td>Profit for the year attributable to:</td>\n<td></td>\n<td></td>\n<td></td>\n</tr>\n<tr>\n<td>Owners of the Company</td>\n<td></td>\n<td>8,986</td>\n<td>8,191</td>\n</tr>\n<tr>\n<td>Non-Controlling Interest</td>\n<td></td>\n<td>364</td>\n<td>252</td>\n</tr>\n<tr>\n<td>Other Comprehensive Income/ (expense) for the year attributable to:</td>\n<td></td>\n<td></td>\n<td></td>\n</tr>\n<tr>\n<td>Owners of the Company</td>\n<td></td>\n<td>(102)</td>\n<td>(130)</td>\n</tr>\n<tr>\n<td>Non-Controlling Interest</td>\n<td></td>\n<td>(2)</td>\n<td>(3)</td>\n</tr>\n<tr>\n<td>Total Comprehensive Income/(loss) for the year attributable to:</td>\n<td></td>\n<td></td>\n<td></td>\n</tr>\n<tr>\n<td>Owners of the Company</td>\n<td></td>\n<td>8,884</td>\n<td>8,061</td>\n</tr>\n<tr>\n<td>Non-Controlling Interest</td>\n<td></td>\n<td>362</td>\n<td>249</td>\n</tr>\n<tr>\n<td>Earnings per equity share of par value of ₹ 5 each</td>\n<td></td>\n<td></td>\n<td></td>\n</tr>\n<tr>\n<td>Basic (in ₹ )</td>\n<td>43</td>\n<td>62.50</td>\n<td>56.97</td>\n</tr>\n<tr>\n<td>Diluted (in ₹ )</td>\n<td>43</td>\n<td>62.50</td>\n<td>56.97</td>\n</tr>\n</table>"
//         ],
//         "consolidated cash flow statement": [
//             "<table>\n<tr>\n<th>Particulars</th>\n<th>Year ended March 31, 2024</th>\n<th>Year ended March 31, 2023</th>\n</tr>\n<tr>\n<td>Cash flow from Operating Activities</td>\n<td></td>\n<td></td>\n</tr>\n<tr>\n<td>Profit for the year</td>\n<td>9,350</td>\n<td>8,443</td>\n</tr>\n<tr>\n<td>Adjustments for:</td>\n<td></td>\n<td></td>\n</tr>\n<tr>\n<td>Depreciation and amortisation expense</td>\n<td>6,870</td>\n<td>6,154</td>\n</tr>\n<tr>\n<td>Loss on Sale of Property Plant &amp; Equipment (net)</td>\n<td>36</td>\n<td>150</td>\n</tr>\n<tr>\n<td>Profit on Sale of Investments (net)</td>\n<td>(90)</td>\n<td>(157)</td>\n</tr>\n<tr>\n<td>Share of (profit)/loss of assoicates</td>\n<td>(180)</td>\n<td>432</td>\n</tr>\n<tr>\n<td>Income tax expense</td>\n<td>4,455</td>\n<td>2,562</td>\n</tr>\n<tr>\n<td>Finance costs</td>\n<td>4,494</td>\n<td>3,808</td>\n</tr>\n<tr>\n<td>Interest income</td>\n<td>(429)</td>\n<td>(444)</td>\n</tr>\n<tr>\n<td>Expected Credit Loss on trade receivables</td>\n<td>738</td>\n<td>543</td>\n</tr>\n<tr>\n<td>Provision written back</td>\n<td>(20)</td>\n<td>(31)</td>\n</tr>\n<tr>\n<td>Gain on fair valuation of existing interest in a joint venture pursuant to acquisition of control (Refer Note 64.1)</td>\n<td>(19)</td>\n<td>-</td>\n</tr>\n<tr>\n<td>Net gain/(loss) arising on financial assets designated as at FVTPL</td>\n<td>(284)</td>\n<td>(128)</td>\n</tr>\n<tr>\n<td>Share-based compensation expense</td>\n<td>875</td>\n<td>760</td>\n</tr>\n<tr>\n<td>Unrealised foreign exchange loss (net)</td>\n<td>1</td>\n<td>(3)</td>\n</tr>\n<tr>\n<td>Operating Cash Flow before working capital changes</td>\n<td>25,797</td>\n<td>22,089</td>\n</tr>\n<tr>\n<td>(Increase)/decrease in operating assets</td>\n<td></td>\n<td></td>\n</tr>\n<tr>\n<td>Inventories</td>\n<td>(692)</td>\n<td>419</td>\n</tr>\n<tr>\n<td>Trade receivables</td>\n<td>(3,352)</td>\n<td>(5,218)</td>\n</tr>\n<tr>\n<td>Other financial assets - Non current</td>\n<td>(2,212)</td>\n<td>(662)</td>\n</tr>\n<tr>\n<td>Other financial assets - Current</td>\n<td>(160)</td>\n<td>(885)</td>\n</tr>\n<tr>\n<td>Other non-current assets</td>\n<td>233</td>\n<td>(327)</td>\n</tr>\n<tr>\n<td>Other current assets</td>\n<td>(245)</td>\n<td>(1,005)</td>\n</tr>\n<tr>\n<td>Contract assets</td>\n<td>18</td>\n<td>(146)</td>\n</tr>\n<tr>\n<td></td>\n<td>(6,410)</td>\n<td>(7,824)</td>\n</tr>\n<tr>\n<td>Increase/(decrease) in operating liabilities</td>\n<td></td>\n<td></td>\n</tr>\n<tr>\n<td>Trade payables</td>\n<td>4,108</td>\n<td>2,809</td>\n</tr>\n<tr>\n<td>Other financial liabilities-Non current</td>\n<td>(6,058)</td>\n<td>101</td>\n</tr>\n<tr>\n<td>Other financial liabilities-Current</td>\n<td>6,140</td>\n<td>(208)</td>\n</tr>\n<tr>\n<td>Provisions</td>\n<td>332</td>\n<td>191</td>\n</tr>\n<tr>\n<td>Other Non-Current Liabilities</td>\n<td>(19)</td>\n<td>6</td>\n</tr>\n<tr>\n<td>Other Current Liabilities</td>\n<td>(21)</td>\n<td>425</td>\n</tr>\n<tr>\n<td></td>\n<td>4,482</td>\n<td>3,324</td>\n</tr>\n<tr>\n<td>Cash generated from operations</td>\n<td>23,869</td>\n<td>17,589</td>\n</tr>\n<tr>\n<td>Net income tax paid</td>\n<td>(4,667)</td>\n<td>(3,820)</td>\n</tr>\n<tr>\n<td>Net cash generated from operating activities (A)</td>\n<td>19,202</td>\n<td>13,769</td>\n</tr>\n<tr>\n<td>Cash flow from Investing Activities</td>\n<td></td>\n<td></td>\n</tr>\n<tr>\n<td>Purchase of Property plant &amp; equipment, CWIP &amp; Intangibles</td>\n<td>(11,368)</td>\n<td>(11,285)</td>\n</tr>\n<tr>\n<td>Proceeds from sale of Property Plant and Equipment</td>\n<td>19</td>\n<td>41</td>\n</tr>\n<tr>\n<td>Investment in Bank Deposits</td>\n<td>(859)</td>\n<td>-</td>\n</tr>\n<tr>\n<td>Proceeds from bank deposits</td>\n<td>-</td>\n<td>355</td>\n</tr>\n<tr>\n<td>Purchase of investments in Subsidiary/Business acquisitions</td>\n<td>(37)</td>\n<td>(499)</td>\n</tr>\n<tr>\n<td>Proceeds from sale of Non current investments</td>\n<td>57</td>\n<td>168</td>\n</tr>\n<tr>\n<td>Purchase of Non current investments</td>\n<td>(57)</td>\n<td>(195)</td>\n</tr>\n</table>"
//         ]
//     }

// }

const CurrencySelect = React.memo(
  ({ onChange }: { onChange: (value: string) => void }) => (
    <SelectGroup label="Currency">
      <Select defaultValue="inr" onValueChange={onChange}>
        <SelectTrigger className="h-9 w-full bg-white border-[#eaf0fc] text-[#001742] rounded">
          <SelectValue placeholder="Select currency" />
        </SelectTrigger>
        <SelectContent className="bg-white shadow-custom-blue rounded">
          <SelectItem value="inr" className="cursor-pointer">
            INR
          </SelectItem>
          <SelectItem value="usd" className="cursor-pointer">
            USD
          </SelectItem>
        </SelectContent>
      </Select>
    </SelectGroup>
  ),
);

const UnitSelect = React.memo(
  ({
    currency,
    onChange,
  }: {
    currency: string;
    onChange: (value: string) => void;
  }) => (
    <SelectGroup label="Unit">
      <Select
        defaultValue={currency === "inr" ? "lakh" : "thousand"}
        onValueChange={onChange}
      >
        <SelectTrigger className="h-9 w-full bg-white border-[#eaf0fc] text-[#001742] rounded">
          <SelectValue placeholder="Select unit" />
        </SelectTrigger>
        <SelectContent className="bg-white shadow-custom-blue rounded">
          {currency === "inr" ? (
            <>
              <SelectItem value="thousand" className="cursor-pointer">
                Thousand
              </SelectItem>
              <SelectItem value="lakh" className="cursor-pointer">
                Lakh
              </SelectItem>
              <SelectItem value="millions" className="cursor-pointer">
                Millions
              </SelectItem>
              <SelectItem value="crore" className="cursor-pointer">
                Crore
              </SelectItem>
            </>
          ) : (
            <>
              <SelectItem value="thousand" className="cursor-pointer">
                Thousand
              </SelectItem>
              <SelectItem value="million" className="cursor-pointer">
                Million
              </SelectItem>
              <SelectItem value="billion" className="cursor-pointer">
                Billion
              </SelectItem>
            </>
          )}
        </SelectContent>
      </Select>
    </SelectGroup>
  ),
);

const DecimalSelect = React.memo(() => (
  <SelectGroup label="Decimal">
    <Select defaultValue="0.1">
      <SelectTrigger className="h-9 w-full bg-white border-[#eaf0fc] text-[#001742] rounded">
        <SelectValue placeholder="Select decimal" />
      </SelectTrigger>
      <SelectContent className="bg-white shadow-custom-blue rounded">
        <SelectItem value="0.001" className="cursor-pointer">
          0.0001
        </SelectItem>
        <SelectItem value="0.01" className="cursor-pointer">
          0.001
        </SelectItem>
        <SelectItem value="0.1" className="cursor-pointer">
          0.01
        </SelectItem>
        <SelectItem value="1" className="cursor-pointer">
          0.1
        </SelectItem>
      </SelectContent>
    </Select>
  </SelectGroup>
));

const SelectGroup = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="flex flex-col flex-1 gap-1.5">
    <label className="text-sm font-medium text-neutral-700">{label}</label>
    {children}
  </div>
);

const LoadingState = () => (
  <div className="flex-1 flex items-center justify-center text-neutral-600">
    Loading financial data...
  </div>
);

const ErrorState = ({ message }: { message: string }) => (
  <div className="flex-1 flex items-center justify-center text-red-600">
    {message}
  </div>
);

export default function FinancialPreview({
  defaultOpen = false,
  documentId,
}: {
  defaultOpen?: boolean;
  documentId: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formattedData, setFormattedData] = useState<FinancialData>({});
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [currency, setCurrency] = useState("inr");
  const [unit, setUnit] = useState("lakh");

  const { financialData } = useSelector(
    (state: RootState) => state.financialStatements,
  ) as { financialData: { [key: string]: FinancialDataType } };

  const statements = useMemo(
    () => Object.keys(financialData[documentId].data),
    [financialData, documentId],
  );

  useEffect(() => {
    const initializeData = async () => {
      try {
        const formatted = formatFinancialData(financialData[documentId]);
        if (Object.keys(formatted).length === 0) {
          throw new Error("No valid financial data found");
        }
        setFormattedData(formatted);
        setSelectedCategory(statements[0]);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Error processing financial data",
        );
        console.error("Error in financial preview:", err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
  }, [statements]);

  const handleCurrencyChange = (value: string) => {
    setCurrency(value);
    setUnit(value === "inr" ? "lakh" : "thousand");
  };

  const renderContent = () => {
    if (isLoading) return <LoadingState />;
    if (error) return <ErrorState message={error} />;

    return (
      <>
        <DialogHeader className="px-3 py-2 border-b-2 border-[#eaf0fc] flex flex-row items-center justify-between w-full">
          <DialogTitle className="text-lg font-medium">
            Financial Statements
          </DialogTitle>
          <X
            className="h-5 w-5 hover:cursor-pointer"
            onClick={() => setOpen(false)}
          />
        </DialogHeader>

        <div className="flex flex-col md:flex-row items-start md:items-center px-3 py-2 bg-[#fffff] gap-4">
          <div className="grid grid-cols-1 md:grid-cols-3 w-full gap-4">
            <CurrencySelect onChange={handleCurrencyChange} />
            <UnitSelect currency={currency} onChange={setUnit} />
            <DecimalSelect />
          </div>
        </div>

        <Tabs
          value={selectedCategory}
          onValueChange={setSelectedCategory}
          className="flex-1 flex flex-col min-h-0 overflow-hidden"
        >
          <div className="flex-1 overflow-hidden flex flex-col px-3 py-2">
            <div className="flex-1 overflow-hidden scrollbar-hide">
              <Table className=" ">
                <TableBody>
                  {statements.map((statement) => (
                    <TabsContent
                      key={statement}
                      value={statement}
                      className="p-0 mt-0"
                    >
                      <HTMLToShadcnTable
                        htmlContent={
                          financialData[documentId].data[statement][0]
                        }
                        className={extractedTableStyles.styledTable}
                      />
                    </TabsContent>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between px-3 py-2 rounded-b border-t-2 border-[#eaf0fc] bg-[#ffffff] gap-4">
            <TabsList className="bg-[#f7f9fe] py-1 px-2 h-[45px] w-full md:w-auto overflow-x-auto flex-nowrap scrollbar-hide rounded min-w-0">
              {statements.map((statement) => (
                <TabsTrigger
                  key={statement}
                  value={statement}
                  className="text-sm text-[#9babc7] data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-black rounded-t-[8px] hover:bg-white whitespace-nowrap px-4 py-2 min-w-max"
                >
                  {formatStatementName(statement)}
                </TabsTrigger>
              ))}
            </TabsList>

            <Button className="w-full md:w-auto bg-[#004CE6] hover:bg-[#004CE6]/90 h-10 px-6 rounded text-white">
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Export to Excel
            </Button>
          </div>
        </Tabs>
      </>
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 text-[#001742]">
          <FileSpreadsheet className="h-4 w-4" />
          View Financials
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-7xl p-0 h-[90vh] flex flex-col rounded gap-0">
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}
