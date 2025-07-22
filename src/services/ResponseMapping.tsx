export const handleChartConfigResponse = (
  response: Record<string, any>,
): Record<string, any> => {
  if (Object.keys(response)?.length > 0) {
    return response["series"]?.reduce((acc: any, initialValue: any) => {
      acc[initialValue["key"]] = {
        label: initialValue["label"],
        color: initialValue["color"],
      };
      return acc;
    }, {});
  }
  return {};
};

// implement to show the relveant chunks in both the pages - aditya
export const handleExtractionResponse = (
  data: Record<string, any>,
): Record<string, any> => {
  const sets = new Set();
  Object.values(data).forEach((sections) => {
    sections.forEach((section: Record<string, any>) => {
      const coordinates = section["coordinates"];
      if (coordinates && Object.keys(coordinates).length > 1) {
        Object.keys(coordinates).forEach((key, index) => {
          if (index !== 0) {
            if (!sets.has(section.section_id)) {
              data[key] = data[key] || [];
              data[key].unshift(section);
              sets.add(section.section_id);
            }
          }
        });
      }
    });
  });
  return data;
};

export const setActiveFlags = <T extends object>(
  items: T[],
  activeIndex: number = 0,
): (T & { isActive: boolean })[] => {
  return items.map((item, index) => ({
    ...item,
    isActive: index === activeIndex,
  }));
};


export const extractTableData = (jsonData: any) => {
  // Extract source table efficiently
  const sourceTable = jsonData?.data?.source_table || {};
  
  const sourceInfo = {
      title: sourceTable?.title || "",
      page_number: sourceTable?.page_number || "",
      table_html: sourceTable?.html || ""
  };

  // Extract similar tables with minimal iteration
  const results = jsonData?.data?.results || {};
  const similarTables = [];

  for (const docUrl in results) {
      if (Object.hasOwn(results, docUrl)) {
          for (const tableId in results[docUrl]) {
              if (Object.hasOwn(results[docUrl], tableId)) {
                  const tableData = results[docUrl][tableId];

                  similarTables.push({
                      title: tableData?.title || "",
                      page_number: tableData?.page_number || "",
                      similarity: tableData?.similarity || 0,
                      table_url: tableData?.table_url || "",
                      table_html: tableData?.html || ""
                  });
              }
          }
      }
  }

  return { sourceInfo, similarTables };
}
