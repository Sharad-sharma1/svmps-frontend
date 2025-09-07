import React, { useState, useEffect } from 'react';
import './CreateReceipt.css';

// Function to convert English numbers to Gujarati numerals
const convertToGujaratiNumerals = (num) => {
  if (!num) return '';
  const englishToGujarati = {
    '0': '૦', '1': '૧', '2': '૨', '3': '૩', '4': '૪',
    '5': '૫', '6': '૬', '7': '૭', '8': '૮', '9': '૯'
  };
  return num.toString().replace(/[0-9]/g, (digit) => englishToGujarati[digit] || digit);
};

// Function to convert Gujarati numerals to English numbers
const convertToEnglishNumbers = (gujaratiNum) => {
  if (!gujaratiNum) return '';
  const gujaratiToEnglish = {
    '૦': '0', '૧': '1', '૨': '2', '૩': '3', '૪': '4',
    '૫': '5', '૬': '6', '૭': '7', '૮': '8', '૯': '9'
  };
  return gujaratiNum.toString().replace(/[૦-૯]/g, (digit) => gujaratiToEnglish[digit] || digit);
};

// Function to convert numbers to Gujarati words
const numberToGujaratiWords = (num) => {
  if (!num || num === '' || isNaN(num)) return '';
  
  const number = parseInt(num);
  if (number === 0) return 'શૂન્ય';
  
  const ones = ['', 'એક', 'બે', 'ત્રણ', 'ચાર', 'પાંચ', 'છ', 'સાત', 'આઠ', 'નવ'];
  const teens = ['દસ', 'અગિયાર', 'બાર', 'તેર', 'ચૌદ', 'પંદર', 'સોળ', 'સત્તર', 'અઢાર', 'ઓગણીસ'];
  const tens = ['', '', 'વીસ', 'ત્રીસ', 'ચાળીસ', 'પચાસ', 'સાઠ', 'સિત્તેર', 'એંસી', 'નેવું'];
  const hundreds = ['', 'એકસો', 'બેસો', 'ત્રણસો', 'ચારસો', 'પાંચસો', 'છસો', 'સાતસો', 'આઠસો', 'નવસો'];
  
  if (number < 10) {
    return ones[number];
  } else if (number < 20) {
    return teens[number - 10];
  } else if (number < 100) {
    return tens[Math.floor(number / 10)] + (number % 10 ? ' ' + ones[number % 10] : '');
  } else if (number < 1000) {
    return hundreds[Math.floor(number / 100)] + (number % 100 ? ' ' + numberToGujaratiWords(number % 100) : '');
  } else if (number < 100000) {
    return numberToGujaratiWords(Math.floor(number / 1000)) + ' હજાર' + (number % 1000 ? ' ' + numberToGujaratiWords(number % 1000) : '');
  } else if (number < 10000000) {
    return numberToGujaratiWords(Math.floor(number / 100000)) + ' લાખ' + (number % 100000 ? ' ' + numberToGujaratiWords(number % 100000) : '');
  } else {
    return numberToGujaratiWords(Math.floor(number / 10000000)) + ' કરોડ' + (number % 10000000 ? ' ' + numberToGujaratiWords(number % 10000000) : '');
  }
};

const CreateReceipt = () => {
  const [receiptData, setReceiptData] = useState({
    receiptNo: '',
    date: new Date().toLocaleDateString('en-GB').split('/').join('-'), // Today's date in DD-MM-YYYY format
    name: '',
    village: '',
    residence: '',
    mobile: '',
    relation: '',
    paymentMode: '',
    paymentDetails: '',
    donation1: '',
    donation2: '',
    total: ''
  });

  // State for display values (Gujarati numerals)
  const [displayValues, setDisplayValues] = useState({
    donation1Display: '',
    donation2Display: '',
    totalDisplay: '',
    totalWordsDisplay: '',
    dateDisplay: ''
  });

  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // Auto-generate receipt number on component mount and set initial date display
  useEffect(() => {
    generateReceiptNumber();
    // Set initial date display in Gujarati numerals (DD-MM-YYYY format)
    const todayDate = new Date().toLocaleDateString('en-GB').split('/').join('-');
    setDisplayValues(prev => ({
      ...prev,
      dateDisplay: convertToGujaratiNumerals(todayDate)
    }));
  }, []);

  // Auto-calculate total when donations change
  useEffect(() => {
    const donation1Amount = parseFloat(receiptData.donation1) || 0;
    const donation2Amount = parseFloat(receiptData.donation2) || 0;
    const calculatedTotal = donation1Amount + donation2Amount;
    
    // Update total if there's a sum, or clear it if both fields are empty
    if (calculatedTotal > 0) {
      const totalString = calculatedTotal.toString();
      setReceiptData(prev => ({
        ...prev,
        total: totalString
      }));
      // Update total display with Gujarati numerals and words
      setDisplayValues(prev => ({
        ...prev,
        totalDisplay: convertToGujaratiNumerals(totalString),
        totalWordsDisplay: numberToGujaratiWords(totalString)
      }));
    } else if (receiptData.donation1 === '' && receiptData.donation2 === '') {
      setReceiptData(prev => ({
        ...prev,
        total: ''
      }));
      setDisplayValues(prev => ({
        ...prev,
        totalDisplay: '',
        totalWordsDisplay: ''
      }));
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
    
    // Handle amount fields specially for Gujarati numeral conversion
    if (name === 'donation1' || name === 'donation2') {
      // Convert Gujarati numerals to English numbers for calculation
      const englishValue = convertToEnglishNumbers(value);
      // Only allow numbers and decimal point
      if (englishValue === '' || /^\d*\.?\d*$/.test(englishValue)) {
        setReceiptData(prev => ({
          ...prev,
          [name]: englishValue
        }));
        // Update display value with Gujarati numerals
        setDisplayValues(prev => ({
          ...prev,
          [`${name}Display`]: convertToGujaratiNumerals(englishValue)
        }));
      }
    } else if (name === 'date') {
      // Handle date field for Gujarati numeral conversion
      // Convert Gujarati numerals back to English for storage
      const englishValue = convertToEnglishNumbers(value);
      
      // Validate date format DD-MM-YYYY (allow partial input)
      if (englishValue === '' || /^\d{0,2}-?\d{0,2}-?\d{0,4}$/.test(englishValue)) {
        setReceiptData(prev => ({
          ...prev,
          [name]: englishValue
        }));
        // Update date display with Gujarati numerals
        setDisplayValues(prev => ({
          ...prev,
          dateDisplay: convertToGujaratiNumerals(englishValue)
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
      alert('Receipt saved successfully! (Database integration pending)');
    } catch (error) {
      console.error('Error saving receipt:', error);
      alert('Error saving receipt. Please try again.');
    }
  };

  const handlePrintReceipt = () => {
    setIsPreviewMode(true);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const handleDownloadPDF = () => {
    // TODO: Implement PDF download functionality using libraries like jsPDF or react-pdf
    console.log('Downloading PDF:', receiptData);
    alert('PDF download functionality will be implemented soon!');
  };

  const handleReset = () => {
    const todayDate = new Date().toLocaleDateString('en-GB').split('/').join('-');
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
      donation1: '',
      donation2: '',
      total: ''
    });
    setDisplayValues({
      donation1Display: '',
      donation2Display: '',
      totalDisplay: '',
      totalWordsDisplay: '',
      dateDisplay: convertToGujaratiNumerals(todayDate)
    });
    generateReceiptNumber();
    setIsPreviewMode(false);
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
            <button onClick={handlePrintReceipt} className="btn btn-print">
              🖨️ Print Receipt
            </button>
            <button onClick={handleDownloadPDF} className="btn btn-download">
              📄 Download PDF
            </button>
            <button onClick={handleReset} className="btn btn-reset">
              🔄 Reset Form
            </button>
          </div>
        </div>
      )}

      <div className="receipt-form">
        <div className="receipt">
          <div className="receipt-header">
            <div className="left">
              <div className="logo-placeholder">
                🏛️
              </div>
            </div>
            <div className="title">
              શ્રી વિરધર્મા ધાનદાર મેવાડા સુધાર સમાજ<br />
              સમૂહ લગન ટ્રસ્ટ, સિદ્ધપુર
            </div>
            <div className="right">
              <div className="logo-placeholder">
                🏛️
              </div>
            </div>
          </div>
          
          <div className="contact-info">
            <div className="contact-line">રજી. નં. ૯/૧૦, પાટણ, તા. ૩-૧૨-૨૦૦૮</div>
            <div className="contact-line">C/o. "સેવા સદન" મેવાડા ટીમભિની સામે, દેવલી રોડ, સિદ્ધપુર - ૩૪૫૧૫</div>
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
              <label style={{width: '60px', marginLeft: '40px'}}>તારીખ</label>
              <input
                className="input-line date-input"
                type="text"
                name="date"
                value={displayValues.dateDisplay}
                onChange={handleInputChange}
                readOnly={isPreviewMode}
                placeholder="DD-MM-YYYY"
                style={{width: '90px', marginRight: '20px', borderBottom: 'none', fontSize: '1rem'}}
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
                <td className="col-desc">કંડોગ્રીઃ (કોર્પસ ફંડ) / _____ સમૂહ લગન ખર્ચ / દાન ભેટ</td>
                <td className="col-amt">
                  <input
                    type="text"
                    name="donation1"
                    value={displayValues.donation1Display}
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
                    value={displayValues.donation2Display}
                    onChange={handleInputChange}
                    placeholder="Amount"
                    readOnly={isPreviewMode}
                  />
                </td>
              </tr>
              <tr className="total-row">
                <td colSpan="2" style={{textAlign:'left', paddingLeft:'8px', verticalAlign:'middle', fontSize:'1.1rem', fontWeight:'normal', height:'32px'}}>
                  <span style={{fontWeight:'bold'}}>અંકે રૂપિયા: </span>{displayValues.totalWordsDisplay && `${displayValues.totalWordsDisplay} રૂપિયા`}
                </td>
                <td className="col-amt" style={{position:'relative', height:'32px'}}>
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', width:'100%'}}>
                    <span style={{fontWeight:'bold', fontSize:'1.1rem'}}>કુલ</span>
                    <input
                      type="text"
                      name="total"
                      value={displayValues.totalDisplay}
                      onChange={handleInputChange}
                      readOnly
                      style={{width:'auto', minWidth:'60px', textAlign:'right', border:'none', background:'transparent', fontSize:'1.1rem', fontWeight:'normal'}}
                    />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <div style={{height:'20px'}}></div>
          
          <div className="footer-sign">સ્વીકૃતિ કરનારની સહી</div>
        </div>
      </div>

      {isPreviewMode && (
        <div className="preview-actions no-print">
          <button onClick={() => setIsPreviewMode(false)} className="btn btn-edit">
            ✏️ Edit Receipt
          </button>
        </div>
      )}
    </div>
  );
};

export default CreateReceipt;
