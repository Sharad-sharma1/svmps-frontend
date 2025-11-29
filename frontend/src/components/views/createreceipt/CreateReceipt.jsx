import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import StatusOverlay from '../../common/StatusOverlay';
import SiddhapurLogo from '../../../assets/images/Siddhapur_Logo_01.png';
import OrganizationLogo from '../../../assets/images/organization-logo.bmp';
import './CreateReceipt.css';

// Function to convert numbers to English words
const numberToEnglishWords = (num) => {
  if (!num || num === '' || isNaN(num)) return '';
  
  const number = parseInt(num);
  if (number === 0) return 'Zero';
  
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const hundreds = ['', 'One Hundred', 'Two Hundred', 'Three Hundred', 'Four Hundred', 'Five Hundred', 'Six Hundred', 'Seven Hundred', 'Eight Hundred', 'Nine Hundred'];
  
  if (number < 10) {
    return ones[number];
  } else if (number < 20) {
    return teens[number - 10];
  } else if (number < 100) {
    return tens[Math.floor(number / 10)] + (number % 10 ? ' ' + ones[number % 10] : '');
  } else if (number < 1000) {
    return hundreds[Math.floor(number / 100)] + (number % 100 ? ' ' + numberToEnglishWords(number % 100) : '');
  } else if (number < 100000) {
    return numberToEnglishWords(Math.floor(number / 1000)) + ' Thousand' + (number % 1000 ? ' ' + numberToEnglishWords(number % 1000) : '');
  } else if (number < 10000000) {
    return numberToEnglishWords(Math.floor(number / 100000)) + ' Lakh' + (number % 100000 ? ' ' + numberToEnglishWords(number % 100000) : '');
  } else {
    return numberToEnglishWords(Math.floor(number / 10000000)) + ' Crore' + (number % 10000000 ? ' ' + numberToEnglishWords(number % 10000000) : '');
  }
};

const CreateReceipt = () => {
  const [receiptData, setReceiptData] = useState({
    receiptNo: '',
    date: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format for HTML date input
    name: '',
    village: '',
    residence: '',
    mobile: '',
    relation: '',
    paymentMode: '',
    paymentDetails: '',
    donation1Purpose: '',
    donation1: '',
    donation2: '',
    total: ''
  });

  // State for total words display
  const [totalWordsDisplay, setTotalWordsDisplay] = useState('');

  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // Format number with Indian comma system
  const formatIndianNumber = (num) => {
    if (!num) return '';
    const cleanNum = num.toString().replace(/,/g, '');
    if (!/^\d+$/.test(cleanNum)) return num;
    
    const numStr = cleanNum.toString();
    const lastThree = numStr.substring(numStr.length - 3);
    const otherNumbers = numStr.substring(0, numStr.length - 3);
    
    if (otherNumbers !== '') {
      return otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree;
    } else {
      return lastThree;
    }
  };

  // Remove commas to get actual number value
  const getNumericValue = (formattedNum) => {
    return formattedNum.toString().replace(/,/g, '');
  };

  // Enhanced popup state for StatusOverlay
  const [overlayState, setOverlayState] = useState({
    isVisible: false,
    message: "",
    isError: false,
    errorType: "general",
    pendingAction: null
  });

  const { logout } = useAuth();

  // Auto-generate receipt number on component mount
  useEffect(() => {
    generateReceiptNumber();
  }, []);

  // Auto-calculate total when donations change
  useEffect(() => {
    const donation1Amount = parseFloat(getNumericValue(receiptData.donation1)) || 0;
    const donation2Amount = parseFloat(getNumericValue(receiptData.donation2)) || 0;
    const calculatedTotal = donation1Amount + donation2Amount;
    
    // Update total if there's a sum, or clear it if both fields are empty
    if (calculatedTotal > 0) {
      const totalString = formatIndianNumber(calculatedTotal.toString());
      setReceiptData(prev => ({
        ...prev,
        total: totalString
      }));
      // Update total words display with English words
      setTotalWordsDisplay(numberToEnglishWords(calculatedTotal.toString()));
    } else if (receiptData.donation1 === '' && receiptData.donation2 === '') {
      setReceiptData(prev => ({
        ...prev,
        total: ''
      }));
      setTotalWordsDisplay('');
    }
  }, [receiptData.donation1, receiptData.donation2]);

  const generateReceiptNumber = () => {
    // TODO: In future, get the next receipt number from database
    const currentYear = new Date().getFullYear();
    const randomNum = Math.floor(Math.random() * 10000);
    const receiptNo = `RCT/${currentYear}/${randomNum.toString().padStart(4, '0')}`;
    
    setReceiptData(prev => ({
      ...prev,
      receiptNo: receiptNo
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Handle amount fields with validation and formatting
    if (name === 'donation1' || name === 'donation2') {
      // Remove commas and validate input
      const numericValue = getNumericValue(value);
      if (numericValue === '' || /^\d*\.?\d*$/.test(numericValue)) {
        const formattedValue = formatIndianNumber(numericValue);
        setReceiptData(prev => ({
          ...prev,
          [name]: formattedValue
        }));
      }
    } else {
      setReceiptData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSaveReceipt = async () => {
    try {
      // TODO: Implement database save functionality
      console.log('Saving receipt data:', receiptData);
      
      // Show success message and switch to preview mode
      setOverlayState({
        isVisible: true,
        message: "Receipt saved successfully! (Database integration pending)",
        isError: false,
        errorType: "general",
        pendingAction: { type: 'switchToPreview' }
      });
    } catch (error) {
      console.error('Error saving receipt:', error);
      setOverlayState({
        isVisible: true,
        message: "Error saving receipt. Please try again.",
        isError: true,
        errorType: "general",
        pendingAction: null
      });
    }
  };

  const optimizePrintStyles = () => {
    const printCSS = document.createElement('style');
    printCSS.innerHTML = `
      @media print {
        * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        .create-receipt-container { background: white !important; }
        .receipt { 
          font-family: 'Noto Sans Gujarati', 'Noto Sans', Arial, sans-serif !important; 
          width: 200mm !important; 
          border: 3px solid #000 !important;
          padding: 5px !important;
          margin: 15mm auto 0 auto !important;
          transform: none !important;
          max-height: 135mm !important;
          position: relative !important;
          font-size: 11pt !important;
        }
        .receipt::before {
          content: "Original receipt" !important;
          position: absolute !important;
          top: -8mm !important;
          left: 50% !important;
          transform: translateX(-50%) !important;
          font-size: 14px !important;
          font-weight: 700 !important;
          color: #000 !important;
          text-align: center !important;
          width: 100% !important;
          display: block !important;
        }
        .copy-receipt::before {
          content: "Duplicate receipt" !important;
          position: absolute !important;
          top: -8mm !important;
          left: 50% !important;
          transform: translateX(-50%) !important;
          font-size: 14px !important;
          font-weight: 700 !important;
          color: #000 !important;
          text-align: center !important;
          width: 100% !important;
          display: block !important;
        }
        .receipt-header { 
          background: #000 !important; 
          color: #ffffff !important; 
          display: flex !important;
          height: 60px !important;
        }
        .receipt-header * { color: #ffffff !important; }
        .receipt-header .title { 
          color: #ffffff !important; 
          font-weight: 700 !important; 
          font-size: 18px !important;
        }
        .footer-sign { 
          margin-top: 8px !important; 
          padding-right: 10px !important; 
          font-size: 11px !important;
          font-weight: 800 !important;
        }
        .donation thead th { 
          background: #d9d9d9 !important; 
          color: #000 !important; 
          border: 2px solid #000 !important;
          font-size: 10px !important;
          height: 18px !important;
          padding: 1px 3px !important;
        }
        .devotional-line { font-size: 14px !important; }
        .contact-line { font-size: 10px !important; }
        .form-row label { font-size: 10px !important; }
        .form-row .input-line { font-size: 10px !important; height: 16px !important; padding: 1px 3px !important; }
        .donation tbody td { font-size: 9px !important; height: 12px !important; padding: 1px 4px !important; }
        .donation .total-row td { font-size: 11px !important; height: 14px !important; padding: 1px 4px !important; }
        .donation .total-row td:first-child { text-align: left !important; padding-left: 8px !important; font-weight: normal !important; }
        .form-row { margin-bottom: 3px !important; gap: 4px !important; }
        .donation { margin-top: 3px !important; }
        .receipt-form-area { padding: 3px 3px 0 3px !important; }
        .payment-dropdown { height: 20px !important; padding: 1px 3px !important; }
      }
    `;
    document.head.appendChild(printCSS);
    
    // Remove after print is done
    setTimeout(() => {
      if (document.head.contains(printCSS)) {
        document.head.removeChild(printCSS);
      }
    }, 5000);
  };

  const handlePrintReceipt = () => {
    // Optimize print styles
    optimizePrintStyles();
    
    // Wait for DOM to update and styles to apply
    setTimeout(() => {
      // Ensure all images are loaded before printing
      const images = document.querySelectorAll('.receipt img');
      let imagesLoaded = 0;
      const totalImages = images.length;
      
      const checkImagesAndPrint = () => {
        if (imagesLoaded === totalImages) {
          // Additional delay to ensure styles are fully applied
          setTimeout(() => {
            window.print();
          }, 200);
        }
      };
      
      if (totalImages === 0) {
        // No images to wait for
        setTimeout(() => {
          window.print();
        }, 300);
      } else {
        images.forEach((img) => {
          if (img.complete) {
            imagesLoaded++;
          } else {
            img.onload = () => {
              imagesLoaded++;
              checkImagesAndPrint();
            };
            img.onerror = () => {
              imagesLoaded++; // Count even failed images
              checkImagesAndPrint();
            };
          }
        });
        checkImagesAndPrint();
      }
    }, 150);
  };

  const handleDownloadPDF = () => {
    // TODO: Implement PDF download functionality using libraries like jsPDF or react-pdf
    console.log('Downloading PDF:', receiptData);
    setOverlayState({
      isVisible: true,
      message: "PDF download functionality will be implemented soon!",
      isError: false,
      errorType: "general",
      pendingAction: null
    });
  };

  const handleReset = () => {
    const todayDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format for HTML date input
    setReceiptData({
      receiptNo: '',
      date: todayDate,
      name: '',
      village: '',
      residence: '',
      mobile: '',
      relation: '',
      paymentMode: '',
      paymentDetails: '',
      donation1Purpose: '',
      donation1: '',
      donation2: '',
      total: ''
    });
    setTotalWordsDisplay('');
    generateReceiptNumber();
    setIsPreviewMode(false);
  };

  // Handle overlay actions
  const handleOverlayAction = (action) => {
    if (action?.type === 'switchToPreview') {
      setIsPreviewMode(true);
    }
    setOverlayState({ ...overlayState, isVisible: false });
  };

  return (
    <div className="create-receipt-container">
      {!isPreviewMode && (
        <div className="receipt-actions">
          <h1 className="page-title">Create Receipt</h1>
          <div className="action-buttons">
            <button onClick={handleSaveReceipt} className="btn btn-save">
              💾 Save Receipt
            </button>
          </div>
        </div>
      )}

      {isPreviewMode && (
        <div className="receipt-actions no-print">
          <h1 className="page-title">Receipt Preview</h1>
          <div className="action-buttons">
            <button onClick={() => setIsPreviewMode(false)} className="btn btn-edit">
              ✏️ Edit Receipt
            </button>
            <button onClick={handlePrintReceipt} className="btn btn-print">
              🖨️ Print Receipt
            </button>
          </div>
        </div>
      )}

      <div className="receipt-form">
        <div className="receipt">
          <div className="devotional-line">
            ॥ શ્રી વિશ્વકર્મણે નમઃ ॥
          </div>
          <div className="receipt-header">
            <div className="left">
              <div className="logo-container left-container">
                <img 
                  src={SiddhapurLogo} 
                  alt="Siddhapur Logo" 
                  className="receipt-logo left-logo"
                />
              </div>
            </div>
            <div className="title">
              શ્રી વિશ્વકર્મા ધાનધાર મેવાડા સુથાર સમાજ <br />
              સમૂહ લગ્ન ટ્રસ્ટ, સિધ્ધપુર
            </div>
            <div className="right">
              <div className="logo-container">
                <img 
                  src={OrganizationLogo} 
                  alt="Organization Logo" 
                  className="receipt-logo right-logo"
                />
              </div>
            </div>
          </div>
          
          <div className="contact-info">
            <div className="contact-line">રજી. નં. એ/૯૭૮, પાટણ તા.૩-૧૨-૨૦૦૮</div>
            <div className="contact-line">C/o."સેવા સદન" મેવાડા ટીમ્બરની સામે, દેથળી રોડ, સિધ્ધપુર - ૩૮૪૧૫૧</div>
          </div>
          
          <div className="separator"></div>

          <div className="receipt-form-area">
            <div className="form-row">
              <label>રસીદ નં.</label>
              <input
                className="input-line"
                type="text"
                name="receiptNo"
                value={receiptData.receiptNo}
                onChange={handleInputChange}
                readOnly={isPreviewMode}
                placeholder="Receipt Number"
                style={{borderBottom: 'none'}}
              />
              <div style={{flex: 1}}></div>
              <label style={{width: '40px', marginLeft: '80px'}}>તારીખ</label>
              <input
                className="input-line date-input"
                type="date"
                name="date"
                value={receiptData.date}
                onChange={handleInputChange}
                readOnly={isPreviewMode}
                style={{marginRight: '5px', borderBottom: 'none'}}
              />
            </div>
            
            <div className="form-row">
              <label>શ્રી/શ્રીમતી,</label>
              <input
                className="input-line"
                type="text"
                name="name"
                value={receiptData.name}
                onChange={handleInputChange}
                placeholder="Name"
                readOnly={isPreviewMode}
              />
            </div>
            
            <div className="form-row">
              <label>મૂળ વતન :</label>
              <input
                className="input-line"
                type="text"
                name="village"
                value={receiptData.village}
                onChange={handleInputChange}
                placeholder="Village"
                readOnly={isPreviewMode}
              />
              <label style={{width: '90px'}}>રહેવાણ :</label>
              <input
                className="input-line"
                type="text"
                name="residence"
                value={receiptData.residence}
                onChange={handleInputChange}
                placeholder="Residence"
                readOnly={isPreviewMode}
              />
            </div>
            
            <div className="form-row">
              <label>મોબાઇલ નં.</label>
              <input
                className="input-line"
                type="text"
                name="mobile"
                value={receiptData.mobile}
                onChange={handleInputChange}
                placeholder="Mobile Number"
                readOnly={isPreviewMode}
              />
              <label style={{width: '90px'}}>સરનામું</label>
              <input
                className="input-line"
                type="text"
                name="relation"
                value={receiptData.relation}
                onChange={handleInputChange}
                placeholder="Address/Relation"
                readOnly={isPreviewMode}
              />
            </div>
            
            <div className="form-row">
              <label style={{width: '180px'}}>કેશ/ચેક/ઓનલાઈન થી</label>
              <select
                className="payment-dropdown"
                name="paymentMode"
                value={receiptData.paymentMode}
                onChange={handleInputChange}
                disabled={isPreviewMode}
              >
                <option value="">પસંદ કરો</option>
                <option value="કેશ / Cash">કેશ / Cash</option>
                <option value="ચેક / Check">ચેક / Check</option>
                <option value="ઓનલાઈન / Online">ઓનલાઈન / Online</option>
              </select>
              <input
                className="input-line"
                type="text"
                name="paymentDetails"
                value={receiptData.paymentDetails}
                onChange={handleInputChange}
                placeholder=""
                readOnly={isPreviewMode}
                style={{marginLeft: '10px'}}
              />
            </div>
          </div>

          <table className="donation">
            <thead>
              <tr>
                <th className="col-no">ક્રમ</th>
                <th className="col-desc">દાનની વિગત</th>
                <th className="col-amt">રકમ</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="col-no">1</td>
                <td className="col-desc">
                  કંડોગ્રીઃ (કોર્પસ ફંડ) / 
                  <input
                    type="text"
                    name="donation1Purpose"
                    value={receiptData.donation1Purpose}
                    onChange={handleInputChange}
                    placeholder="ખર્ચ પ્રકાર લખો"
                    readOnly={isPreviewMode}
                  />
                  સમૂહ લગ્ન ખર્ચ / દાન ભેટ
                </td>
                <td className="col-amt">
                  <input
                    type="text"
                    name="donation1"
                    value={receiptData.donation1}
                    onChange={handleInputChange}
                    placeholder="Amount"
                    readOnly={isPreviewMode}
                  />
                </td>
              </tr>
              <tr>
                <td className="col-no">2</td>
                <td className="col-desc">અન્ય દાન :</td>
                <td className="col-amt">
                  <input
                    type="text"
                    name="donation2"
                    value={receiptData.donation2}
                    onChange={handleInputChange}
                    placeholder="Amount"
                    readOnly={isPreviewMode}
                  />
                </td>
              </tr>
              <tr className="total-row">
                <td colSpan="2" style={{textAlign:'left', paddingLeft:'8px', verticalAlign:'middle', fontSize:'1rem', fontWeight:'normal', height:'32px'}}>
                  <span style={{fontWeight:'bold'}}>અંકે રૂપિયા: </span><span style={{fontWeight:'normal'}}>{totalWordsDisplay && `${totalWordsDisplay} Rupees`}</span>
                </td>
                <td className="col-amt">
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', width:'100%'}}>
                    <span style={{fontWeight:'bold', fontSize:'1rem'}}>કુલ</span>
                    <input
                      type="text"
                      name="total"
                      value={receiptData.total}
                      onChange={handleInputChange}
                      readOnly
                      style={{width:'auto', minWidth:'60px', textAlign:'right', border:'none', background:'transparent', fontSize:'0.85rem', fontWeight:'normal'}}
                    />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <div style={{height:'30px'}}></div>
          
          <div className="footer-sign">સ્વીકૃત કરનારની સહી</div>
        </div>
      </div>
{/* ----------------------------------------------  duplicate receipt ----------------------------------------------- */}
      <div className="receipt-form">
        <div className="receipt copy-receipt">
          <div className="devotional-line">
            ॥ શ્રી વિશ્વકર્મણે નમઃ ॥
          </div>
          <div className="receipt-header">
            <div className="left">
              <div className="logo-container left-container">
                <img 
                  src={SiddhapurLogo} 
                  alt="Siddhapુર Logo" 
                  className="receipt-logo left-logo"
                />
              </div>
            </div>
            <div className="title">
              શ્રી વિશ્વકર્મા ધાનધાર મેવાડા સુથાર સમાજ <br />
              સમૂહ લગ્ન ટ્રસ્ટ, સિધ્ધપુર
            </div>
            <div className="right">
              <div className="logo-container">
                <img 
                  src={OrganizationLogo} 
                  alt="Organization Logo" 
                  className="receipt-logo right-logo"
                />
              </div>
            </div>
          </div>
          
          <div className="contact-info">
            <div className="contact-line">રજી. નં. એ/૯૭૮, પાટણ તા.૩-૧૨-૨૦૦૮</div>
            <div className="contact-line">C/o."સેવા સદન" મેવાડા ટીમ્બરની સામે, દેથળી રોડ, સિધ્ધપુર - ૩૮૪૧૫૧</div>
          </div>
          
          <div className="separator"></div>

          <div className="receipt-form-area">
            <div className="form-row">
              <label>રસીદ નં.</label>
              <input
                className="input-line"
                type="text"
                name="receiptNo"
                value={receiptData.receiptNo}
                onChange={handleInputChange}
                readOnly={isPreviewMode}
                placeholder="Receipt Number"
                style={{borderBottom: 'none'}}
              />
              <div style={{flex: 1}}></div>
              <label style={{width: '40px', marginLeft: '80px'}}>તારીખ</label>
              <input
                className="input-line date-input"
                type="date"
                name="date"
                value={receiptData.date}
                onChange={handleInputChange}
                readOnly={isPreviewMode}
                style={{marginRight: '5px', borderBottom: 'none'}}
              />
            </div>
            
            <div className="form-row">
              <label>શ્રી/શ્રીમતી,</label>
              <input
                className="input-line"
                type="text"
                name="name"
                value={receiptData.name}
                onChange={handleInputChange}
                placeholder="Name"
                readOnly={isPreviewMode}
              />
            </div>
            
            <div className="form-row">
              <label>મૂળ વતન :</label>
              <input
                className="input-line"
                type="text"
                name="village"
                value={receiptData.village}
                onChange={handleInputChange}
                placeholder="Village"
                readOnly={isPreviewMode}
              />
              <label style={{width: '90px'}}>રહેવાણ :</label>
              <input
                className="input-line"
                type="text"
                name="residence"
                value={receiptData.residence}
                onChange={handleInputChange}
                placeholder="Residence"
                readOnly={isPreviewMode}
              />
            </div>
            
            <div className="form-row">
              <label>મોબાઇલ નં.</label>
              <input
                className="input-line"
                type="text"
                name="mobile"
                value={receiptData.mobile}
                onChange={handleInputChange}
                placeholder="Mobile Number"
                readOnly={isPreviewMode}
              />
              <label style={{width: '90px'}}>સરનામું</label>
              <input
                className="input-line"
                type="text"
                name="relation"
                value={receiptData.relation}
                onChange={handleInputChange}
                placeholder="Address/Relation"
                readOnly={isPreviewMode}
              />
            </div>
            
            <div className="form-row">
              <label style={{width: '180px'}}>કેશ/ચેક/ઓનલાઈન થી</label>
              <select
                className="payment-dropdown"
                name="paymentMode"
                value={receiptData.paymentMode}
                onChange={handleInputChange}
                disabled={isPreviewMode}
              >
                <option value="">પસંદ કરો</option>
                <option value="કેશ / Cash">કેશ / Cash</option>
                <option value="ચેક / Check">ચેક / Check</option>
                <option value="ઓનલાઈન / Online">ઓનલાઈન / Online</option>
              </select>
              <input
                className="input-line"
                type="text"
                name="paymentDetails"
                value={receiptData.paymentDetails}
                onChange={handleInputChange}
                placeholder=""
                readOnly={isPreviewMode}
                style={{marginLeft: '10px'}}
              />
            </div>
          </div>

          <table className="donation">
            <thead>
              <tr>
                <th className="col-no">ક્રમ</th>
                <th className="col-desc">દાનની વિગત</th>
                <th className="col-amt">રકમ</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="col-no">1</td>
                <td className="col-desc">
                  કંડોગ્રીઃ (કોર્પસ ફંડ) / 
                  <input
                    type="text"
                    name="donation1Purpose"
                    value={receiptData.donation1Purpose}
                    onChange={handleInputChange}
                    placeholder="ખર્ચ પ્રકાર લખો"
                    readOnly={isPreviewMode}
                  />
                  સમૂહ લગ્ન ખર્ચ / દાન ભેટ
                </td>
                <td className="col-amt">
                  <input
                    type="text"
                    name="donation1"
                    value={receiptData.donation1}
                    onChange={handleInputChange}
                    placeholder="Amount"
                    readOnly={isPreviewMode}
                  />
                </td>
              </tr>
              <tr>
                <td className="col-no">2</td>
                <td className="col-desc">અન્ય દાન :</td>
                <td className="col-amt">
                  <input
                    type="text"
                    name="donation2"
                    value={receiptData.donation2}
                    onChange={handleInputChange}
                    placeholder="Amount"
                    readOnly={isPreviewMode}
                  />
                </td>
              </tr>
              <tr className="total-row">
                <td colSpan="2" style={{textAlign:'left', paddingLeft:'8px', verticalAlign:'middle', fontSize:'1rem', fontWeight:'normal', height:'32px'}}>
                  <span style={{fontWeight:'bold'}}>અંકે રૂપિયા: </span><span style={{fontWeight:'normal'}}>{totalWordsDisplay && `${totalWordsDisplay} Rupees`}</span>
                </td>
                <td className="col-amt">
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', width:'100%'}}>
                    <span style={{fontWeight:'bold', fontSize:'1rem'}}>કુલ</span>
                    <input
                      type="text"
                      name="total"
                      value={receiptData.total}
                      onChange={handleInputChange}
                      readOnly
                      style={{width:'auto', minWidth:'60px', textAlign:'right', border:'none', background:'transparent', fontSize:'0.85rem', fontWeight:'normal'}}
                    />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <div style={{height:'30px'}}></div>
          
          <div className="footer-sign">સ્વીકૃત કરનારની સહી</div>
        </div>
      </div>

      {/* StatusOverlay for all popup messages */}
      <StatusOverlay
        isVisible={overlayState.isVisible}
        message={overlayState.message}
        isError={overlayState.isError}
        errorType={overlayState.errorType}
        onRetry={null}
        onClose={() => {
          handleOverlayAction(overlayState.pendingAction);
        }}
        onLoginAgain={overlayState.errorType === 'unauthorized' || overlayState.errorType === 'auth' ? logout : null}
      />
    </div>
  );
};

export default CreateReceipt;
