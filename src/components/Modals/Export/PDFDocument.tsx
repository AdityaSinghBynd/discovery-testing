import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

interface PDFDocumentProps {
    blocks: any[];
    title: string;
}

// Create styles
const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        padding: 20,
    },
    title: {
        fontSize: 24,
        marginBottom: 20,
        fontWeight: 'bold',
    },
    section: {
        marginBottom: 10,
    },
    paragraph: {
        fontSize: 12,
        lineHeight: 1.5,
        marginBottom: 10,
    },
    header: {
        fontSize: 18,
        marginBottom: 10,
        fontWeight: 'bold',
    },
    image: {
        marginVertical: 10,
        maxWidth: '100%',
        objectFit: 'contain',
    },
    table: {
        width: 'auto',
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: '#000',
        marginVertical: 10,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#000',
    },
    tableHeader: {
        backgroundColor: '#f0f0f0',
    },
    tableCell: {
        padding: 5,
        fontSize: 10,
        borderRightWidth: 1,
        borderRightColor: '#000',
        flex: 1,
    },
});

// Helper function to clean HTML from text
const cleanHtml = (text: string) => {
    return text.replace(/<[^>]*>/g, '');
};

// Helper function to render different block types
const renderBlock = (block: any) => {
    if (!block || !block.type || !block.data) {
        console.warn('Invalid block:', block);
        return null;
    }

    switch (block.type) {
        case 'header':
            return (
                <Text
                    key={block.id}
                    style={[
                        styles.header,
                        { fontSize: block.data.level === 1 ? 20 : block.data.level === 2 ? 18 : 16 }
                    ]}
                >
                    {cleanHtml(block.data.text)}
                </Text>
            );

        case 'paragraph':
            return (
                <Text key={block.id} style={styles.paragraph}>
                    {cleanHtml(block.data.text)}
                </Text>
            );

        case 'image':
            return (
                <View key={block.id} style={styles.section}>
                    <Image
                        src={block.data.file?.url || block.data.url}
                        style={styles.image}
                    />
                    {block.data.caption && (
                        <Text style={[styles.paragraph, { textAlign: 'center', fontSize: 10 }]}>
                            {cleanHtml(block.data.caption)}
                        </Text>
                    )}
                </View>
            );

        case 'table':
            if (!block.data.content || !Array.isArray(block.data.content)) {
                console.warn('Invalid table data:', block.data);
                return null;
            }
            return (
                <View key={block.id} style={styles.table}>
                    {block.data.content.map((row: string[], rowIndex: number) => (
                        <View
                            key={`row-${rowIndex}`}
                            style={[
                                styles.tableRow,
                                rowIndex === 0 && block.data.withHeadings && styles.tableHeader,
                            ]}
                        >
                            {row.map((cell: string, cellIndex: number) => (
                                <Text
                                    key={`cell-${rowIndex}-${cellIndex}`}
                                    style={[
                                        styles.tableCell,
                                        { width: `${100 / row.length}%` },
                                    ]}
                                >
                                    {cleanHtml(cell)}
                                </Text>
                            ))}
                        </View>
                    ))}
                </View>
            );

        default:
            console.warn('Unsupported block type:', block.type);
            return null;
    }
};

export const PDFDocument: React.FC<PDFDocumentProps> = ({ blocks, title }) => {
    
    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <Text style={styles.title}>{title}</Text>
                {Array.isArray(blocks) ? (
                    blocks.map((block) => renderBlock(block))
                ) : (
                    <Text style={styles.paragraph}>No content available</Text>
                )}
            </Page>
        </Document>
    );
}; 