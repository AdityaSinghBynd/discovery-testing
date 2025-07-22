"use client";

import React from 'react'
// Components
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import HTMLToShadcnTable from '@/components/Html/Table';
// Types & Constants
// const DEFAULT_CURRENCY = "inr";
// const DEFAULT_UNIT = "lakhs";
// const DEFAULT_DECIMALS = "2";

// interface SelectGroupProps {
//   label: string;
//   children: React.ReactNode;
// }

const mergeMockData = `<table>\n <tr>\n <th>Particulars</th>
        <th>2021</th>
        <th>2022</th>
        <th>2023</th>
        <th>2024</th>\n
    </tr>\n <tr>\n <td>Food delivery</td>
        <td>2160.00</td>
        <td>4760.00</td>
        <td>6150.00</td>
        <td>-</td>\n
    </tr>\n <tr>\n <td>Food delivery</td>
        <td>-</td>
        <td>-766</td>
        <td>-10</td>
        <td>912</td>\n
    </tr>\n <tr>\n <td>Hyperpure (B2B supplies)</td>
        <td>200.00</td>
        <td>540.00</td>
        <td>1510.00</td>
        <td>-</td>\n
    </tr>\n <tr>\n <td>Quick commerce(1)</td>
        <td>-</td>
        <td>-</td>
        <td>-562</td>
        <td>-384</td>\n
    </tr>\n <tr>\n <td>Quick commerce</td>
        <td>-</td>
        <td>-</td>
        <td>810.00</td>
        <td>-</td>\n
    </tr>\n <tr>\n <td>Going-out(2)</td>
        <td>-</td>
        <td>-</td>
        <td>-13</td>
        <td>-6</td>\n
    </tr>\n <tr>\n <td>Others</td>
        <td>280.00</td>
        <td>240.00</td>
        <td>230.00</td>
        <td>-</td>\n
    </tr>\n <tr>\n <td>B2B supplies (Hyperpure)</td>
        <td>-</td>
        <td>-139</td>
        <td>-194</td>
        <td>-126</td>\n
    </tr>\n <tr>\n <td>Total</td>
        <td>2650.00</td>
        <td>5540.00</td>
        <td>8690.00</td>
        <td>-</td>\n
    </tr>\n <tr>\n <td>Others(3)</td>
        <td>-</td>
        <td>-68</td>
        <td>-3</td>
        <td>-24</td>\n
    </tr>\n <tr>\n <td>YoY % change</td>
        <td>-15.0%</td>
        <td>109.0%</td>
        <td>57.0%</td>
        <td>-</td>\n
    </tr>\n <tr>\n <td>Total</td>
        <td>-</td>
        <td>-973</td>
        <td>-783</td>
        <td>372</td>\n
    </tr>\n <tr>\n <td>Total (ex-quick commerce)</td>
        <td>2650.00</td>
        <td>5540.00</td>
        <td>7890.00</td>
        <td>-</td>\n
    </tr>\n <tr>\n <td>YoY % change</td>
        <td>-15.0%</td>
        <td>109.0%</td>
        <td>42.0%</td>
        <td>-</td>\n
    </tr>\n</table>`;

// const SelectGroup: React.FC<SelectGroupProps> = ({ label, children }) => (
//   <div className="flex flex-col gap-2">
//     <label className="text-sm font-medium text-text-primary">{label}</label>
//     {children}
//   </div>
// );

// const units = [
//   { value: 'lakhs', label: 'Lakhs' },
//   { value: 'crores', label: 'Crores' },
//   { value: 'millions', label: 'Millions' },
//   { value: 'billions', label: 'Billions' }
// ];

// const currencies = [
//   { value: 'inr', label: 'INR' },
//   { value: 'usd', label: 'USD' },
//   { value: 'eur', label: 'EUR' },
//   { value: 'gbp', label: 'GBP' }
// ];

// const decimals = [0, 1, 2, 3, 4];

const CombinedTable = () => {
  // const [selectedCurrency, setSelectedCurrency] = React.useState(DEFAULT_CURRENCY);
  // const [selectedUnit, setSelectedUnit] = React.useState(DEFAULT_UNIT);
  // const [selectedDecimal, setSelectedDecimal] = React.useState(DEFAULT_DECIMALS);

  return (
    <div className='w-full h-full flex flex-col items-start justify-between gap-2'>
      <main className='w-full h-full flex flex-col items-start justify-start gap-2'>
        <div className="flex flex-col items-start px-3 py-2 w-full bg-white gap-4">
          
          {/* <div className="grid grid-cols-1 md:grid-cols-3 max-w-max gap-3">

            <SelectGroup label="Currency">
              <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
                <SelectTrigger className="w-[250px] border !border-[#eaf0fc]">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent className='bg-white border !border-[#eaf0fc] shadow-custom-blue'>
                  {currencies.map(({ value, label }) => (
                    <SelectItem key={value} value={value} className="cursor-pointer">
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </SelectGroup>

            <SelectGroup label="Unit">
              <Select value={selectedUnit} onValueChange={setSelectedUnit}>
                <SelectTrigger className="w-[250px] border !border-[#eaf0fc]">
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent className='bg-white border !border-[#eaf0fc] shadow-custom-blue'>
                  {units.map(({ value, label }) => (
                    <SelectItem key={value} value={value} className="cursor-pointer">
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </SelectGroup>

            <SelectGroup label="Decimal">
              <Select value={selectedDecimal} onValueChange={setSelectedDecimal}>
                <SelectTrigger className="w-[250px] border !border-[#eaf0fc]">
                  <SelectValue placeholder="Select decimal" />
                </SelectTrigger>
                <SelectContent className='bg-white border !border-[#eaf0fc] shadow-custom-blue'>
                  {decimals.map(value => (
                    <SelectItem key={value} value={value.toString()} className="cursor-pointer">
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </SelectGroup>
          </div> */}

          {/* HTML Table */}
          <div className='w-full h-full bg-white border border-[#eaf0fc] rounded-md'>
            <HTMLToShadcnTable htmlContent={mergeMockData} />
          </div>

        </div>
      </main>

      <footer className='w-full px-3 py-2 bg-white border-t border-[#eaf0fc] flex items-center justify-end'>
        <button 
          className='px-4 py-2 bg-[#017736] text-white rounded-md hover:bg-[#015e2b] transition-colors'
          // onClick={() => console.log('Export clicked', { selectedCurrency, selectedUnit, selectedDecimal })}
        >
          Export in Excel
        </button>
      </footer>
    </div>
  )
}

export default CombinedTable