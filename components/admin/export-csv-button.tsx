// components/admin/export-csv-button.tsx
'use client';

import { motion } from 'framer-motion';
import { Download } from 'lucide-react';

interface ExportCSVButtonProps {
  data: {
    stats: any;
    salesSeries: any[];
    statusSeries: any[];
    topProducts: any[];
    citySeries: any[];
    lowStock: any[];
    orders: any[];
    items: any[];
    dateRange: {
      from: Date;
      to: Date;
    };
  };
}

export function ExportCSVButton({ data }: ExportCSVButtonProps) {
  const exportToCSV = () => {
    const {
      stats,
      salesSeries,
      statusSeries,
      topProducts,
      citySeries,
      lowStock,
      orders,
      items,
      dateRange
    } = data;

    // Helper function to convert data to CSV format
    const convertToCSV = (objArray: any[], headers?: string[]) => {
      const array = typeof objArray !== 'object' ? JSON.parse(objArray) : objArray;
      let str = '';
      
      // Add headers
      if (headers) {
        str += headers.join(',') + '\r\n';
      } else if (array.length > 0) {
        const header = Object.keys(array[0]);
        str += header.join(',') + '\r\n';
      }
      
      // Add rows
      array.forEach((obj: any) => {
        let line = '';
        Object.values(obj).forEach(value => {
          if (line !== '') line += ',';
          // Handle values that might contain commas
          const stringValue = String(value).replace(/"/g, '""');
          line += `"${stringValue}"`;
        });
        str += line + '\r\n';
      });
      
      return str;
    };

    // Create CSV content for each section
    const csvContent = [
      'DASHBOARD EXPORT REPORT',
      `Exported on: ${new Date().toLocaleString()}`,
      `Date Range: ${dateRange.from.toLocaleDateString()} - ${dateRange.to.toLocaleDateString()}`,
      '',
      
      'SUMMARY STATISTICS',
      convertToCSV([{
        'Total Revenue (MAD)': stats.revenue,
        'Total Orders': stats.orders,
        'Total Customers': stats.customers,
        'Average Order Value (MAD)': stats.avgOrder,
        'Revenue Growth': stats.growth.revenue,
        'Orders Growth': stats.growth.orders,
        'Customers Growth': stats.growth.customers,
        'AOV Growth': stats.growth.avgOrder
      }]),
      
      '',
      'SALES OVER TIME',
      convertToCSV(salesSeries, ['Date', 'Total Sales (MAD)']),
      
      '',
      'ORDERS BY STATUS',
      convertToCSV(statusSeries, ['Status', 'Order Count']),
      
      '',
      'TOP PRODUCTS',
      convertToCSV(topProducts, ['Product Title', 'Quantity Sold']),
      
      '',
      'ORDERS BY CITY',
      convertToCSV(citySeries, ['City', 'Order Count']),
      
      '',
      'LOW STOCK ALERTS',
      convertToCSV(lowStock.map(item => ({
        'Product Title': item.variant.title,
        'Size': item.size,
        'SKU': item.sku,
        'Stock Quantity': item.stockQty,
        'Status': item.stockQty === 0 ? 'Out of Stock' : 'Low Stock'
      })), ['Product Title', 'Size', 'SKU', 'Stock Quantity', 'Status']),
      
      '',
      'DETAILED ORDERS',
      convertToCSV(orders.map(order => ({
        'Order ID': order.id,
        'Order Date': order.placedAt ? new Date(order.placedAt).toLocaleDateString() : 'N/A',
        'Status': order.status,
        'Total (MAD)': order.totalMAD,
        'Customer Email': order.email || 'N/A',
        'Shipping City': order.shippingAddress?.city || 'Unknown',
        'Shipping Country': order.shippingAddress?.country || 'Unknown'
      })), ['Order ID', 'Order Date', 'Status', 'Total (MAD)', 'Customer Email', 'Shipping City', 'Shipping Country']),
      
      '',
      'ORDER ITEMS DETAILS',
      convertToCSV(items.map(item => ({
        'Product': item.variantSize.variant.title,
        'Size': item.variantSize.size,
        'Quantity': item.quantity,
        'Unit Price (MAD)': item.unitPriceMAD,
        'Total Price (MAD)': item.quantity * item.unitPriceMAD,
        'Order ID': item.orderId
      })), ['Product', 'Size', 'Quantity', 'Unit Price (MAD)', 'Total Price (MAD)', 'Order ID'])
    ].join('\r\n');

    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `dashboard-export-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={exportToCSV}
          className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-xl transition-all duration-300"
    >
      <Download className="w-4 h-4" />
      <span>Export CSV</span>
    </motion.button>
  );
}