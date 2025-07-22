export interface Message {
  id: string;
  isUser: boolean;
  text?: React.ReactNode | string;
  filename?: string;
  chartImage?: string;
  chartExcel?: string;
  title?: string;
  messageId?: string;
}

export interface ChartMessage {
  chartImage: string;
  chartExcel?: string;
  title?: string;
  description?: string;
  messageId?: string;
  originalMessage?: Message;
}
