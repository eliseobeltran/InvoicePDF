/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* @ FILENAME      : Upaya_Suitelet_UI_Invoice.js
* @ AUTHOR        : eliseo@upayasolutions.com
* @ DATE          : 19th May 2016 (latest revision)
*
* Copyright (c) 2012 Upaya - The Solution Inc. 
* 10530 N. Portal Avenue, Cupertino CA 95014
* All Rights Reserved.
*
* This software is the confidential and proprietary information of 
* Upaya - The Solution Inc. ("Confidential Information"). You shall not
* disclose such Confidential Information and shall use it only in
* accordance with the terms of the license agreement you entered into
* with Upaya.
* object
*/
var InvoiceForm = function(request, response){

	var currSign = "$";
	var context = nlapiGetContext();
	var environment = getEnvironmentURL();

	var paramLogo = nlapiGetContext().getSetting('SCRIPT', 'custscript_inv_logo_file_id');
	var paramPDFTemplate = nlapiGetContext().getSetting('SCRIPT', 'custscript_inv_pdftemplate_file_id');
	var paramCSS = nlapiGetContext().getSetting('SCRIPT', 'custscript_inv_css_file_id');

	var paramAddr1 = nlapiGetContext().getSetting('SCRIPT', 'custscript_invoice_addr1');
	var paramCity = nlapiGetContext().getSetting('SCRIPT', 'custscript_invoice_city');
	var paramProvince = nlapiGetContext().getSetting('SCRIPT', 'custscript_invoice_province');
	var paramCountry = nlapiGetContext().getSetting('SCRIPT', 'custscript_invoice_country');
	var paramPostalCode = nlapiGetContext().getSetting('SCRIPT', 'custscript_invoice_postal_code');
	var paramPhone = nlapiGetContext().getSetting('SCRIPT', 'custscript_invoice_phone');
	var paramFax = nlapiGetContext().getSetting('SCRIPT', 'custscript_invoice_fax');

	var fullAddress = paramAddr1 + "<br />";
	fullAddress += paramCity + ", " + paramProvince + ", " + paramCountry + "<br />";
	fullAddress += paramPostalCode;

	if (request.getMethod() == 'GET'){

		var isPDF = request.getParameter('pdf');
		var generateUI = false;
		var generateLabor = false;
		var generateMaterial = false;
		var generateFreightOtherCharges = false;
		var generateNonInventoryItems = false;
		var generateMarkUp = false;
		var generateDiscount = false;
		var generateBillableItems = false;

		if(isPDF == 'T'){
			
			var generateUI = false;

			var invoiceId = request.getParameter('invoiceId');
			var printItemLine = request.getParameter('items');

			var arrItemLine = printItemLine.split(',');
			var lineCount = 0;

			//Subtotal
			var lineCountLaborSubTotalAmount = 0;
			var lineCountMaterialSubTotalAmount = 0;
			var lineCountFreightOtherCharges = 0;
			var lineCountNonInventoryAmount = 0;
			var lineCountBillableItemsAmount = 0;
			var lineCountMarkUpAmount = 0;
			var lineCountDiscountAmount = 0;

			//Tax Amount
			var lineCountLaborTaxTotalAmount = 0;
			var lineCountMaterialTaxTotalAmount = 0;
			var lineCountFreightOtherChargesTaxTotalAmount = 0;
			var lineCountNonInventoryTaxTotalAmount = 0;
			var lineCountBillableItemsTaxAmount = 0;
			var lineCountMarkUpTaxTotalAmount = 0;
			var lineCountDiscountTaxTotalAmount = 0;

			var lineCountTotalTaxAmount = 0;
			var lineCountTotalAmount = 0;


			//Load HTML Template
			var f = nlapiLoadFile(paramPDFTemplate); //Invoice HTM
			var content = f.getValue();

			//Load CSS Template
			var css = nlapiLoadFile(paramCSS); //CSS

			var companyInformation = objCompanyInformation();
			var businessNum = companyInformation.employerid;

			var logo = nlapiLoadFile(paramLogo);
			var url = logo.getURL();

			var width = "300";
			var height = "78";
			var img = "<img src='" + nlapiEscapeXML(url) + "' style='width:" + width + "px; height:" + height + "px;' />";

			var objInvoiceLabor = getInvoiceLabor(invoiceId);
			var objInvoiceLaborCharge = groupLaborCharge(invoiceId);
			var objInvoiceMaterial = getInvoiceMaterial(invoiceId);
			var objInvoiceBillableItems = getBillableItems(invoiceId);
			var freightOthers = getFreightOtherCharges(invoiceId);
			var nonInventoryItems = getNonInventory(invoiceId);
			var markup = getMarkUp(invoiceId);
			var discount = getDiscount(invoiceId);
			var headerFields = getLaborChargesHeaderFields(invoiceId);
			var headerPDF = getHeaderFields(invoiceId);
			
			if(objInvoiceMaterial.length > 0 || objInvoiceLabor.length > 0 || markup.length > 0 || discount.length > 0 || objInvoiceBillableItems.length > 0 || nonInventoryItems.length > 0){
				generateUI = true;
			}

			if(objInvoiceMaterial.length == 0){
				LogMsg('No Material Item Lines');
			}
			else{
				generateMaterial = true;
			}

			if(objInvoiceLabor.length == 0){
				LogMsg('No Labor Item Lines');
			}
			else{
				generateLabor = true;
			}

			if(freightOthers.length == 0){
				LogMsg('No Freight Other Charges');
			}
			else{
				generateFreightOtherCharges = true;
			}

			if(nonInventoryItems.length == 0){
				LogMsg('No Non-Inventory Item');
			}
			else{
				generateNonInventoryItems = true;
			}
			if(markup.length == 0){
				LogMsg('No Mark-up Item');
			}
			else{
				generateMarkUp = true;
			}
			if(discount.length == 0){
				LogMsg('No Discount Item');
			}
			else{
				generateDiscount = true;
			}
			if(objInvoiceBillableItems.length == 0){
				LogMsg('No Billable Item');
			}
			else{
				generateBillableItems = true;
			}


			var billAddress, tranDate, tranId;

			if(generateUI){
				
				var tranDate = headerPDF[0].trandate;
				var tranId = headerPDF[0].tranid;
	
				//Get Invoice Material info
				var billaddressee = esc(headerPDF[0].billaddressee);
				var billaddr1 = esc(headerPDF[0].billaddr1);
				var billaddr2 = esc(headerPDF[0].billaddr2);
				var billaddr3 = esc(headerPDF[0].billaddr3);
				var billaddr = "";
	
				if(!isBlank(billaddr1)){
					billaddr += billaddr1 + "<br />";
				}
				if(!isBlank(billaddr2)){
					billaddr += billaddr2 + "<br />";
				}
				if(!isBlank(billaddr3)){
					billaddr += billaddr3 + "<br />";
				}
	
				var billcity = esc(headerPDF[0].billcity);
				var billstate = esc(headerPDF[0].billstate);
				var billzip = esc(headerPDF[0].billzip);
				var billcountry = esc(headerPDF[0].billcountry);
			}

			var pst = getPST(invoiceId);
			var state = getState(invoiceId);

			var countLabor = objInvoiceLaborCharge.length;
			var countMaterial = objInvoiceMaterial.length;
			var countBillableItems = objInvoiceBillableItems.length;
			var countFreightOthers = freightOthers.length;
			var countNonInventoryItems = nonInventoryItems.length;
			var countMarkUpItems = markup.length;
			var countDiscountItems = discount.length;

			var countAll = countLabor + countMaterial + countFreightOthers + countNonInventoryItems + countMarkUpItems + countDiscountItems + countBillableItems;

			LogMsg('PRINT ITEM LINES --- LABOR: ' + countLabor);
			LogMsg('PRINT ITEM LINES --- MATERIAL: ' + countMaterial);
			LogMsg('PRINT ITEM LINES --- FREIGHT OTHERS: ' + countFreightOthers);
			LogMsg('PRINT ITEM LINES --- NON-INVENTORY: ' + countNonInventoryItems);
			LogMsg('PRINT ITEM LINES --- BILLABLE ITEMS: ' + countBillableItems);
			LogMsg('PRINT ITEM LINES --- MARK-UP: ' + countMarkUpItems);
			LogMsg('PRINT ITEM LINES --- DISCOUNT: ' + countDiscountItems);
			LogMsg('PRINT ITEM LINES --- TOTAL: ' + countAll);

			var showOrHide = [];

			for(var i = 1;  i <= countAll; i++){
				var index = i - 1;
				showOrHide.push
				(
						{
							'linenumber' : i,
							'show' : arrItemLine[index]
						}
				);
			}

			var totalAmount = "0";

			//Line Item Index

			var pdf = {
				    "Logo": img,
				    "{Invoice}": "Invoice",
				    "BillTo": billAddress,
				    "ProjectNum" : headerFields[0].projectNum,
				    "InvoiceDate": tranDate,
				    "InvoiceNumber": tranId,
				    "BusinessNum" : businessNum,
				    "Billaddressee" : billaddressee,
				    "Billaddr" : billaddr,
				    "Billcity" : billcity,
				    "Billstate" : billstate,
				    "Billzip" : billzip,
				    "Billcountry" : billcountry,
				    "Address1": paramAddr1,
				    "City": paramCity,
				    "Province": paramProvince,
				    "Country": paramCountry,
				    "PostalCode": paramPostalCode,
				    "Phone": paramPhone,
				    "Fax": paramFax,
				    "Location" : headerFields[0].clientlocation,
				    "ProjectDescription" : headerFields[0].projectdescription,
				    "AFE" : headerFields[0].afenumber,
				    "CC" : headerFields[0].costcode,
				    "CONTRACT" : headerFields[0].contractnumber,
				    "SUPERINTENDENT" : headerFields[0].superintendent,
				    "CWP" : headerFields[0].cwpnumber,
				    "CO" : headerFields[0].changeordernum,
				};

			content = content.replace(/{[^{}]+}/g, function(key){
			    return pdf[key.replace(/[{}]+/g, "")] || "";
			});

			content += "<table class='lineitem'>";
			content += "<tr>";
			content += "	<td width='20%'></td>";
			content += "	<td width='40%'></td>";
			content += "	<td width='10%'></td>";
			content += "	<td width='10%'></td>";
			content += "	<td width='10%'></td>";
			content += "	<td width='10%'></td>";
			content += "</tr>";
			content += "<tr>";
			content += "	<td colspan='3'>Detail of Charges</td>";
			content += "	<td colspan='3' align='right'>Business No (GST): " + businessNum + "</td>";
			content += "</tr>";
			content += "<tr class='lineitemheader'>";
			content += "	<td>Item Number / Date</td>";
			content += "	<td>Description</td>";
			content += "	<td align='right'>Unit</td>";
			content += "	<td align='right'>Quantity</td>";
			content += "	<td align='right'>Unit Price</td>";
			content += "	<td align='right'>Line Total</td>";
			content += "</tr>";

			if(objInvoiceLaborCharge.length > 0){

				if(!isNaN(objInvoiceLaborCharge[0].sum)){

					for (var z in objInvoiceLaborCharge){

					lineCount++;

					var index = lineCount - 1;
						if(showOrHide[index] != null){
							if(showOrHide[index].show == 'T'){

								var amount = parseFloat(objInvoiceLaborCharge[z].sum);
								var ticketNum = objInvoiceLaborCharge[z].ticket;

								content += "<tr class='lineitems'>";
								content += "	<td>LABOUR</td>";
								content += "	<td>" + ticketNum.replace('Ticket', '') + "</td>";
								content += "	<td align='right'>-</td>";
								content += "	<td align='right'>-</td>";
								content += "	<td align='right'>-</td>";
								content += "	<td align='right' class='totalbg'>"  + currSign + comma(amount.toFixed(2)) + "</td>";
								content += "</tr>";
							}
						}

					}
				}
			}



			//Create Empty Line Item
			if(objInvoiceMaterial.length > 0 && objInvoiceLaborCharge.length > 0){

				if(!isNaN(objInvoiceLaborCharge[0].sum)){

					content += "<tr class='lineitems'>";
					content += "	<td>&nbsp;</td>";
					content += "	<td>&nbsp;</td>";
					content += "	<td align='right'>&nbsp;</td>";
					content += "	<td align='right'>&nbsp;</td>";
					content += "	<td align='right'>&nbsp;</td>";
					content += "	<td align='right' class='totalbg'>&nbsp;</td>";
					content += "</tr>";

				}

			}

			//MATERIAL
			if(objInvoiceMaterial.length > 0){

				for(var i in objInvoiceMaterial) {

					lineCount++;

					var index = lineCount - 1;

					var billaddress = esc(objInvoiceMaterial[i].billaddress);
					var entity = esc(objInvoiceMaterial[i].entity);
					var formulacurrency = esc(objInvoiceMaterial[i].formulacurrency);
					var item = esc(objInvoiceMaterial[i].item);
					var memo = esc(objInvoiceMaterial[i].memo);
					var quantity = esc(objInvoiceMaterial[i].quantity);
					//var rate = esc(objInvoiceMaterial[i].rate);//Changed 2016.03.16
					var trandate = esc(objInvoiceMaterial[i].trandate);
					var tranid = esc(objInvoiceMaterial[i].tranid);
					var unit = esc(objInvoiceMaterial[i].unit);
					var amount = esc(objInvoiceMaterial[i].amount);
					var taxamount = esc(objInvoiceMaterial[i].taxamount);
					var rate = parseFloat(amount) / parseFloat(quantity);

					//Print only those set to true
					if(showOrHide[index] != null){
						if(showOrHide[index].show == 'T'){
							//Loop items here start
							content += "<tr class='lineitems'>";
							content += "	<td>" + item + "</td>";
							content += "	<td>" + memo + "</td>";
							content += "	<td align='right'>" + unit + "</td>";
							content += "	<td align='right'>" + quantity + "</td>";
							content += "	<td align='right'>" + parseFloat(rate).toFixed(2) + "</td>";
							content += "	<td align='right' class='totalbg'>"  + currSign + comma(amount) + "</td>";
							content += "</tr>";
						}
					}
				}
			}

			//NON-INVENTORY ITEMS
			if(nonInventoryItems.length > 0){

				for(var a in nonInventoryItems){

					lineCount++;

					var index = lineCount - 1;

					var item = nonInventoryItems[a].data[0].item_display;
					var amount = nonInventoryItems[a].data[0].amount;
					var unit = nonInventoryItems[a].data[0].units_display;
					var desc = nonInventoryItems[a].data[0].desc;
					var quantity = nonInventoryItems[a].data[0].quantity;
					var rate = parseFloat(amount) / parseFloat(quantity);
					
					nonInventoryTaxAmount = nonInventoryItems[a].data[0].taxamount;

					if(showOrHide[index] != null){
						if(showOrHide[index].show == 'T'){

							content += "<tr class='lineitems'>";
							content += "	<td>" + item + "</td>";
							content += "	<td>" + desc + "</td>";
							content += "	<td align='right'>" + unit + "</td>";
							content += "	<td align='right'>" + quantity + "</td>";
							content += "	<td align='right'>" + currSign +  comma(rate) + "</td>";
							content += "	<td align='right' class='totalbg'>"  + currSign + comma(amount) + "</td>";
							content += "</tr>";
						}
					}
				}
			}

			//BILLABLE ITEMS
			if(objInvoiceBillableItems.length > 0){

				for(var a in objInvoiceBillableItems){

					lineCount++;

					var index = lineCount - 1;
					var item;
					var itemInfo = objInvoiceBillableItems[a].categorydisp;
					
					if(itemInfo != null)
					{
						item = itemInfo.substr(0, 25);
					}
					else
					{
						item = "";
					}
					var amount = getNum(objInvoiceBillableItems[a].amount);
					billableItemsTaxAmount = getNum(objInvoiceBillableItems[a].taxamount);

					if(showOrHide[index] != null){
						if(showOrHide[index].show == 'T'){

							content += "<tr class='lineitems'>";
							content += "	<td>" + item + "</td>";
							content += "	<td></td>";
							content += "	<td align='right'></td>";
							content += "	<td align='right'></td>";
							content += "	<td align='right'></td>";
							content += "	<td align='right' class='totalbg'>"  + currSign + comma(amount) + "</td>";
							content += "</tr>";
						}
					}
				}
			}
			
			//MARK-UP
			if(markup.length > 0){

				for(var a in markup){

					lineCount++;

					var index = lineCount - 1;

					var item = markup[a].type;
					var amount = markup[a].data[0].amount;
					var unit = markup[a].data[0].units_display;
					markupTaxAmount = markup[a].data[0].taxamount;
					var item_display = markup[a].data[0].item_display;

					if(showOrHide[index] != null){
						if(showOrHide[index].show == 'T'){


							content += "<tr class='lineitems'>";
							content += "	<td>" + item_display + "</td>";
							content += "	<td></td>";
							content += "	<td align='right'></td>";
							content += "	<td align='right'></td>";
							content += "	<td align='right'></td>";
							content += "	<td align='right' class='totalbg'>"  + currSign + comma(amount) + "</td>";
							content += "</tr>";
						}
					}
				}
			}			


			//Create Empty Line Item
			if(discount.length > 0 || freightOthers.length > 0){

				content += "<tr class='lineitems'>";
				content += "	<td>&nbsp;</td>";
				content += "	<td>&nbsp;</td>";
				content += "	<td align='right'>&nbsp;</td>";
				content += "	<td align='right'>&nbsp;</td>";
				content += "	<td align='right'>&nbsp;</td>";
				content += "	<td align='right' class='totalbg'>&nbsp;</td>";
				content += "</tr>";
			}


			if(freightOthers.length > 0){

				for(var a in freightOthers){

					lineCount++;

					var index = lineCount - 1;

					var item = freightOthers[a].type;
					var amount = freightOthers[a].data[0].amount;
					var unit = freightOthers[a].data[0].units_display;
					freightTaxAmount = freightOthers[a].data[0].taxamount;
					var invoice_display = freightOthers[a].data[0].invoice_display;
					var item_display = freightOthers[a].data[0].item_display;

					if(showOrHide[index] != null){
						if(showOrHide[index].show == 'T'){

							var item_show;

							if(invoice_display == null){
								item_show = item_display;
							}
							else{
								item_show = invoice_display;
							}

							content += "<tr class='lineitems'>";
							content += "	<td>" + item_show + "</td>";
							content += "	<td></td>";
							content += "	<td align='right'>" + unit + "</td>";
							content += "	<td align='right'></td>";
							content += "	<td align='right'></td>";
							content += "	<td align='right' class='totalbg'>"  + currSign + comma(amount) + "</td>";
							content += "</tr>";
						}
					}
				}
			}

			//DISCOUNT
			if(discount.length > 0){

				for(var a in discount){

					lineCount++;

					var index = lineCount - 1;

					var item = discount[a].type;
					var amount = discount[a].data[0].amount;
					var unit = discount[a].data[0].units_display;
					discountTaxAmount = discount[a].data[0].taxamount;
					var item_display = discount[a].data[0].item_display;

					if(showOrHide[index] != null){
						if(showOrHide[index].show == 'T'){


							content += "<tr class='lineitems'>";
							content += "	<td style='color:#FF0000'>" + item_display + "</td>";
							content += "	<td></td>";
							content += "	<td align='right'></td>";
							content += "	<td align='right'></td>";
							content += "	<td align='right'></td>";
							content += "	<td align='right' class='totalbg'>"  + currSign + comma(amount) + "</td>";
							content += "</tr>";
						}
					}
				}
			}


			//Add Labor cost to subtotal
			var subTotalAmount = 0;

			if(objInvoiceLabor.length > 0){
				for(var i in objInvoiceLabor){

					lineCountLaborSubTotalAmount++;
					var index = lineCountLaborSubTotalAmount - 1;

					var amount = getNum(objInvoiceLabor[i].amount);
					if(showOrHide[index] != null){
						if(showOrHide[index].show == 'T'){

							subTotalAmount = parseFloat(subTotalAmount) + parseFloat(amount);

						}
					}
				}
			}

			//Add Material cost to subtotal
			if(objInvoiceMaterial.length > 0){
				for(var i in objInvoiceMaterial){

					lineCountMaterialSubTotalAmount++;
					var index = lineCountMaterialSubTotalAmount - 1;

					var amount = getNum(objInvoiceMaterial[i].amount);
					if(showOrHide[index] != null){
						if(showOrHide[index].show == 'T'){
							subTotalAmount = parseFloat(subTotalAmount) + parseFloat(amount);
						}
					}
				}
			}

			//Add Billable cost to subtotal
			if(objInvoiceBillableItems.length > 0){
				for(var i in objInvoiceBillableItems){

					lineCountBillableItemsAmount++;
					var index = lineCountBillableItemsAmount - 1;

					var amount = getNum(objInvoiceBillableItems[i].amount);
					if(showOrHide[index] != null){
						if(showOrHide[index].show == 'T'){
							subTotalAmount = parseFloat(subTotalAmount) + parseFloat(amount);
						}
					}
				}
			}


			//Add Freight cost to subtotal
			if(freightOthers.length > 0){
				for(var i in freightOthers){

					lineCountFreightOtherCharges++;
					var index = lineCountFreightOtherCharges - 1;
					var amount = getNum(freightOthers[i].data[0].amount);
					if(showOrHide[index] != null){
						if(showOrHide[index].show == 'T'){
							subTotalAmount = parseFloat(subTotalAmount) + parseFloat(amount);
						}
					}
				}
			}

			//Add Markup cost to subtotal
			if(markup.length > 0){
				for(var i in markup){

					lineCountMarkUpAmount++;
					var index = lineCountMarkUpAmount - 1;
					var amount = getNum(markup[i].data[0].amount);
					if(showOrHide[index] != null){
						if(showOrHide[index].show == 'T'){
							subTotalAmount = parseFloat(subTotalAmount) + parseFloat(amount);
						}
					}
				}
			}

			//Add Discount cost to subtotal
			if(discount.length > 0){
				for(var i in discount){

					lineCountDiscountAmount++;
					var index = lineCountDiscountAmount - 1;
					var amount = getNum(discount[i].data[0].amount);
					if(showOrHide[index] != null){
						if(showOrHide[index].show == 'T'){
							subTotalAmount = parseFloat(subTotalAmount) + parseFloat(amount);
						}
					}
				}
			}

			//Add Non-Inventory cost to subtotal
			if(nonInventoryItems.length > 0){
				for(var i in nonInventoryItems){

					lineCountNonInventoryAmount++;
					var index = lineCountNonInventoryAmount - 1;
					var amount = getNum(nonInventoryItems[i].data[0].amount);
					if(showOrHide[index] != null){
						if(showOrHide[index].show == 'T'){
							subTotalAmount = parseFloat(subTotalAmount) + parseFloat(amount);
						}
					}
				}
			}

			var taxTotalAmount = 0;

			//Taxes

			//Material Tax
			if(objInvoiceMaterial.length > 0){
				for(var i in objInvoiceMaterial){

					lineCountMaterialTaxTotalAmount++;
					var index = lineCountMaterialTaxTotalAmount - 1;
					var taxamount = getNum(objInvoiceMaterial[i].amount) * parseFloat(.05);

					LogMsg('TAX MATERIAL  ---- Amount: ' + taxamount);

					if(showOrHide[index] != null){
						if(showOrHide[index].show == 'T'){
							taxTotalAmount = parseFloat(taxTotalAmount) + parseFloat(taxamount);
						}
					}
				}
			}

			//Billable Tax
			if(objInvoiceBillableItems.length > 0){
				for(var i in objInvoiceBillableItems){

					lineCountBillableItemsTaxAmount++;
					var index = lineCountBillableItemsTaxAmount - 1;
					var taxamount = getNum(objInvoiceBillableItems[i].taxamount);

					LogMsg('TAX BILLABLE  ---- Amount: ' + taxamount);

					if(showOrHide[index] != null){
						if(showOrHide[index].show == 'T'){
							taxTotalAmount = parseFloat(taxTotalAmount) + parseFloat(taxamount);
						}
					}
				}
			}

			//Labor Tax
			if(objInvoiceLabor.length > 0){
				for(var i in objInvoiceLabor){

					lineCountLaborTaxTotalAmount++;
					var index = lineCountLaborTaxTotalAmount - 1;
					var taxamount = parseFloat(getNum(objInvoiceLabor[i].amount)) * parseFloat(.05);

					LogMsg('TAX LABOR  ---- Amount: ' + taxamount);

					if(showOrHide[index] != null){
						if(showOrHide[index].show == 'T'){
							taxTotalAmount = parseFloat(taxTotalAmount) + parseFloat(taxamount.toFixed(2));
						}
					}
				}
			}

			//Freight Other Charges Tax
			if(freightOthers.length > 0){
				for(var i in freightOthers){

					lineCountFreightOtherChargesTaxTotalAmount++;
					var index = lineCountFreightOtherChargesTaxTotalAmount - 1;
					var taxamount = getNum(freightOthers[i].data[0].taxamount);

					LogMsg('TAX FREIGHT  ---- Amount: ' + taxamount);

					if(showOrHide[index] != null){
						if(showOrHide[index].show == 'T'){
							taxTotalAmount = parseFloat(taxTotalAmount) + parseFloat(taxamount);
						}
					}
				}
			}

			//Markup Charges Tax
			if(markup.length > 0){
				for(var i in markup){

					lineCountMarkUpTaxTotalAmount++;
					var index = lineCountMarkUpTaxTotalAmount - 1;
					var taxamount = getNum(markup[i].data[0].taxamount);

					LogMsg('TAX MARK UP  ---- Amount: ' + taxamount);

					if(showOrHide[index] != null){
						if(showOrHide[index].show == 'T'){
							taxTotalAmount = parseFloat(taxTotalAmount) + parseFloat(taxamount);
						}
					}
				}
			}

			//Discount Charges Tax
			if(discount.length > 0){
				for(var i in discount){

					lineCountDiscountTaxTotalAmount++;
					var index = lineCountDiscountTaxTotalAmount - 1;
					var taxamount = getNum(discount[i].data[0].taxamount);

					LogMsg('TAX DISCOUNT  ---- Amount: ' + taxamount);

					if(showOrHide[index] != null){
						if(showOrHide[index].show == 'T'){
							taxTotalAmount = parseFloat(taxTotalAmount) + parseFloat(taxamount);
						}
					}
				}
			}

			//Non-Inventory Charges Tax
			if(nonInventoryItems.length > 0){
				for(var i in nonInventoryItems){

					lineCountNonInventoryTaxTotalAmount++;
					var index = lineCountNonInventoryTaxTotalAmount - 1;
					var taxamount = getNum(nonInventoryItems[i].data[0].taxamount);

					LogMsg('NON-INVENTORY ITEMS  ---- Amount: ' + taxamount);

					if(showOrHide[index] != null){
						if(showOrHide[index].show == 'T'){
							taxTotalAmount = parseFloat(taxTotalAmount) + parseFloat(taxamount);
						}
					}
				}
			}

			//Include GST
			totalAmount = parseFloat(subTotalAmount) + parseFloat(taxTotalAmount);
			
			//If Manitoba include the pst amount to the total amount 2016.05.19
			if(pst != 0 && state == 'Manitoba'){
				totalAmount += parseFloat(pst);
			}			

			content += "<tr>";
			content += "	<td></td>";
			content += "	<td></td>";
			content += "	<td></td>";
			content += "	<td></td>";
			content += "	<td>Subtotal*</td>";
			content += "	<td align='right' class='totalbg'><span class='thick'>"  + currSign + comma(subTotalAmount.toFixed(2)) + "</span></td>";
			content += "</tr>";
			if(taxTotalAmount > 0)
			{
				content += "<tr>";
				content += "	<td></td>";
				content += "	<td></td>";
				content += "	<td></td>";
				content += "	<td></td>";
				content += "	<td>GST 5%</td>";
				content += "	<td align='right' class='totalbg'><span class='thick'>"  + currSign + comma(taxTotalAmount.toFixed(2)) + "</span></td>";
				content += "</tr>";
			}
			
			if(state == 'Manitoba')
			{
				content += "<tr>";
				content += "	<td></td>";
				content += "	<td></td>";
				content += "	<td></td>";
				content += "	<td></td>";
				content += "	<td>PST 8%</td>";
				content += "	<td align='right' class='totalbg'><span class='thick'>"  + currSign + comma(pst.toFixed(2)) + "</span></td>";
				content += "</tr>";				
			}
			
			content += "<tr>";
			content += "	<td></td>";
			content += "	<td></td>";
			content += "	<td></td>";
			content += "	<td></td>";
			content += "	<td class='totalbgTotal' style='background-color:#fff;' align='right'>Total</td>";
			content += "	<td align='right' class='totalbgTotal'><span class='thick'>" + currSign + comma(totalAmount.toFixed(2)) + "</span></td>";
			content += "</tr>";

			if(pst != 0 && state != 'Manitoba'){
				content += "<tr>";
				content += "	<td colspan='2'></td>";
				content += "	<td colspan='4' align='right'>*There is "+ currSign + comma(pst.toFixed(2)) + " of PST included in this invoice</td>";
				content += "</tr>";
			}

			content += "<tr>";
			content += "	<td>Comments:</td>";
			content += "	<td colspan='5'></td>";
			content += "</tr>";

			content += "</table>";

			var xml = xmlDeclaration();
			xml += "<pdf>";
			xml += header(css.getValue());
			xml += body(content);
			xml += "</pdf>";

			var file = nlapiXMLToPDF(xml);// set content type, file name, and content-disposition (inline means display in browser)
			file.setName("Upaya_Material.pdf");
			file.setFolder(-4); // Documents > Files > File Cabinet > PDF
			var fileid = nlapiSubmitFile(file);

			var filename = "Upaya_Material.pdf";
			response.setContentType('PDF', filename,'inline');// write response to the client
			response.write(file.getValue());

		}
		else{

			var form = nlapiCreateForm('Invoice', false);
			form.setScript('customscript_upy_client_invoice');

			//FIELDS
			var fieldInvoice = form.addField('custpage_invoice', 'text', 'Search Invoice');
			fieldInvoice.setLayoutType('startrow');

			form.addSubmitButton('Search');
			response.writePage(form);
		}
	}
	//POST Method
	else {

		var form = nlapiCreateForm('Invoice', false);
		form.setScript('customscript_upy_client_invoice');
		form.addButton('custpage_invoice_pdf', 'Download PDF', 'download()'); //add button

		//Parameters
		var invoiceId = request.getParameter('custpage_invoice').trim();
		LogMsg('Invoice ID: ' + invoiceId);

		if(isBlank(invoiceId)){
			//Fields
			var fieldInvoice = form.addField('custpage_invoice', 'text', 'Search Invoice');
			fieldInvoice.setDefaultValue(invoiceId);
			fieldInvoice.setLayoutType('startrow');

		}
		else{

			//SEARCH RESULTS
			var objInvoiceMaterial = getInvoiceMaterial(invoiceId);
			var objInvoiceLabor = getInvoiceLabor(invoiceId);
			var objInvoiceLaborCharge = groupLaborCharge(invoiceId);
			var objInvoiceBillableItems = getBillableItems(invoiceId);
			var freightOthers = getFreightOtherCharges(invoiceId);
			var nonInventoryItems = getNonInventory(invoiceId);
			var markup = getMarkUp(invoiceId);
			var discount = getDiscount(invoiceId);
			var headerFields = getLaborChargesHeaderFields(invoiceId);
			var headerPDF = getHeaderFields(invoiceId);

			var totalAmount = 0;
			var generateUI = false;
			var generateLabor = false;
			var generateMaterial = false;
			var generateFreightOtherCharges = false;
			var generateNonInventoryItems = false;
			var generateMarkUp = false;
			var generateDiscount = false;
			var generateBillableItems = false;

			LogMsg('Material: ' + objInvoiceMaterial.length + ' | Labor: ' + objInvoiceLabor.length);

			if(objInvoiceMaterial.length == 0){
				LogMsg('No Material Item Lines');
			}
			else{
				generateMaterial = true;
			}

			if(objInvoiceLabor.length == 0){
				LogMsg('No Labor Item Lines');
			}
			else{
				generateLabor = true;
			}
			if(freightOthers.length == 0){
				LogMsg('No Freight Other Charges');
			}
			else{
				generateFreightOtherCharges = true;
			}
			if(nonInventoryItems.length == 0){
				LogMsg('No Non-Inventory Charges');
			}
			else{
				generateNonInventoryItems = true;
			}

			if(objInvoiceMaterial.length == 0 && objInvoiceLabor.length == 0 && markup.length == 0 && discount.length == 0 && objInvoiceBillableItems.length == 0){
				generateUI = true;
			}
			else{
				generateUI = true;
			}
			if(markup.length == 0){
				LogMsg('No Mark-up Item');
			}
			else{
				generateMarkUp = true;
			}
			if(discount.length == 0){
				LogMsg('No Discount Item');
			}
			else{
				generateDiscount = true;
			}
			if(objInvoiceBillableItems.length == 0){
				LogMsg('No Billable Item');
			}
			else{
				generateBillableItems = true;
			}

			LogMsg('Generate UI: ' + generateUI + ' | Generate Labor: ' + generateLabor + ' | Generate Material: ' + generateMaterial);

			if(generateUI){

				var hBillAddressTo = "";
				var hInvoiceDate = "";
				var hWorkOrderId = "";

				//Variables
				hBillAddressTo = headerPDF[0].billAddress;
				hInvoiceDate = headerPDF[0].trandate;
				hWorkOrderId = headerPDF[0].tranid;

				//Get Invoice Material info
				var billaddressee = esc(headerPDF[0].billaddressee);
				var billaddr1 = esc(headerPDF[0].billaddr1);
				var billaddr2 = esc(headerPDF[0].billaddr2);
				var billaddr3 = esc(headerPDF[0].billaddr3);
				var billaddr = "";

				if(!isBlank(billaddr1)){
					billaddr += billaddr1 + "<br />";
				}
				if(!isBlank(billaddr2)){
					billaddr += billaddr2 + "<br />";
				}
				if(!isBlank(billaddr3)){
					billaddr += billaddr3 + "<br />";
				}

				var billcity = esc(headerPDF[0].billcity);
				var billstate = esc(headerPDF[0].billstate);
				var billzip = esc(headerPDF[0].billzip);
				var billcountry = esc(headerPDF[0].billcountry);

				//Fields
				var fieldInvoice = form.addField('custpage_invoice', 'text', 'Search Invoice');
				fieldInvoice.setDefaultValue(invoiceId);
				fieldInvoice.setLayoutType('startrow');

				//UI
				var companyInformation = objCompanyInformation();
				var businessNum = companyInformation.employerid;

				var environment = "https://system.na1.netsuite.com";
				var logo = nlapiLoadFile(companyInformation.pagelogo);
				var url = environment + logo.getURL();
				var width = "250";
				var height = "65";
				var img = "<img src='" + nlapiEscapeXML(url) + "' style='width:" + width + "px; height:" + height + "px;' />";

				//LOGO
				var fieldLogo = form.addField('custpage_logo', 'inlinehtml');
				fieldLogo.setDefaultValue(img);
				fieldLogo.setLayoutType('startrow', 'startcol');

				//Address
				var fieldMaterialTicket = form.addField('custpage_address', 'text', 'Address');
				fieldMaterialTicket.setDefaultValue(fullAddress);
				fieldMaterialTicket.setDisplayType('inline');

				//Phone
				var fieldPhone = form.addField('custpage_phone', 'text', 'Phone');
				fieldPhone.setDefaultValue(paramPhone);
				fieldPhone.setDisplayType('inline');

				//Fax
				var fieldFax = form.addField('custpage_fax', 'text', 'Fax');
				fieldFax.setDefaultValue(paramFax);
				fieldFax.setDisplayType('inline');

				//Bill To
				var fieldBillTo = form.addField('custpage_billto', 'text', 'Bill To');
				fieldBillTo.setDefaultValue(hBillAddressTo);
				fieldBillTo.setDisplayType('inline');
				fieldBillTo.setBreakType('startcol');

				//Invoice Number
				var fieldInvoiceNum = form.addField('custpage_workorder_num', 'text', 'Invoice Number');
				fieldInvoiceNum.setDefaultValue(hWorkOrderId);
				fieldInvoiceNum.setDisplayType('inline');

				//Invoice Date
				var fieldInvoiceDate = form.addField('custpage_invoice_date', 'text', 'Invoice Date');
				fieldInvoiceDate.setDefaultValue(hInvoiceDate);
				fieldInvoiceDate.setDisplayType('inline');

				//Project No. - PENDING
				var fieldProjectNum = form.addField('custpage_project_number', 'text', 'Project No.');
				fieldProjectNum.setDefaultValue(headerFields[0].projectNum);
				fieldProjectNum.setDisplayType('inline');

				//Project Description
				var fieldProjectDesc= form.addField('custpage_project_description', 'text', 'Project Description');
				fieldProjectDesc.setDefaultValue(headerFields[0].projectdescription);
				fieldProjectDesc.setDisplayType('inline');

				//AFE
				var fieldAFE = form.addField('custpage_afe', 'text', 'AFE#');
				fieldAFE.setDefaultValue(headerFields[0].afenumber);
				fieldAFE.setDisplayType('inline');
				fieldAFE.setBreakType('startcol');

				//CC
				var fieldCC = form.addField('custpage_cc', 'text', 'CC#');
				fieldCC.setDefaultValue(headerFields[0].costcode);
				fieldCC.setDisplayType('inline');

				//CONTRACT#
				var fieldContractNum = form.addField('custpage_contract_num', 'text', 'CONTRACT#');
				fieldContractNum.setDefaultValue(headerFields[0].contractnumber);
				fieldContractNum.setDisplayType('inline');

				//SUPERINTENDENT
				var fieldSuperintendent = form.addField('custpage_superintendent', 'text', 'Superintendent');
				fieldSuperintendent.setDefaultValue(headerFields[0].superintendent);
				fieldSuperintendent.setDisplayType('inline');
				fieldSuperintendent.setBreakType('startcol');

				//CWP/AREA
				var fieldCWP = form.addField('custpage_cwp_area', 'text', 'CWP/Area');
				fieldCWP.setDefaultValue(headerFields[0].cwpnumber);
				fieldCWP.setDisplayType('inline');

				//Change Order#
				var fieldChangeOrder = form.addField('custpage_change_order', 'text', 'Change Order#');
				fieldChangeOrder.setDefaultValue(headerFields[0].changeordernum);
				fieldChangeOrder.setDisplayType('inline');

				//Business No (GST)
				var fieldBusinessNo = form.addField('custpage_business_num', 'text', 'Business No (GST)');
				fieldBusinessNo.setDefaultValue(businessNum);
				fieldBusinessNo.setDisplayType('inline');

				//Hidden fields
				var fieldHidden = form.addField('custpage_hidden', 'text', 'Hidden');
				fieldHidden.setDisplayType('hidden');
				var fieldHiddenInvoiceId = form.addField('custpage_hidden_invoice_id', 'text', 'Hidden Invoice ID');
				fieldHiddenInvoiceId.setDefaultValue(invoiceId);
				fieldHiddenInvoiceId.setDisplayType('hidden');


				//ITEM LINES SECTION
				//Tab
				var tabTicketDetails = form.addTab('custpage_tab_material_ticket', 'Invoice Details');
				//Sublist
				var sublistMaterialTicket = form.addSubList('custpage_sublist_material_ticket','list', 'Invoice Details' , 'custpage_tab_ticket_details');
				sublistMaterialTicket.addField('custpage_checkbox', 'checkbox', 'Print');
				sublistMaterialTicket.addField('custpage_item_number', 'text', 'Item Number / Date');
				sublistMaterialTicket.addField('custpage_description', 'text', 'Description');
				sublistMaterialTicket.addField('custpage_unit', 'text', 'Unit');
				sublistMaterialTicket.addField('custpage_quantity', 'float', 'Quantity');
				sublistMaterialTicket.addField('custpage_unit_price', 'float', 'Unit Price');
				sublistMaterialTicket.addField('custpage_line_total', 'float', 'Total');

				//Labor

				if(generateLabor){

					for (var z = 0; z < objInvoiceLaborCharge.length; z++){
						var linez = z + 1;
						LogMsg('Line: ' + linez + ' | Labor: LABOUR');

						var amount = parseFloat(objInvoiceLaborCharge[z].sum);
						var ticketNum = objInvoiceLaborCharge[z].ticket;

						sublistMaterialTicket.setLineItemValue('custpage_checkbox', linez, 'T');
						sublistMaterialTicket.setLineItemValue('custpage_item_number', linez, 'LABOUR');
						sublistMaterialTicket.setLineItemValue('custpage_description', linez, ticketNum.replace('Ticket', ''));
						sublistMaterialTicket.setLineItemValue('custpage_unit', linez, '');
						sublistMaterialTicket.setLineItemValue('custpage_quantity', linez, '');
						sublistMaterialTicket.setLineItemValue('custpage_unit_price', linez, '');
						sublistMaterialTicket.setLineItemValue('custpage_line_total', linez, amount.toFixed(2));
					}

					for(var i in objInvoiceLabor){
						var amount = objInvoiceLabor[i].amount;
						totalAmount = parseFloat(totalAmount) + parseFloat(amount);
					}
				}

				if(generateMaterial){
					//Material Ticket

					var fCount = sublistMaterialTicket.getLineItemCount();
					if(fCount < 0){ fCount = 0;	}

					for (var i = 0; i < objInvoiceMaterial.length; i++){
						var line = i + 1 + fCount;
						LogMsg('Line: ' + line + ' | Material: ' + objInvoiceMaterial[i].item);

						var rate = parseFloat(objInvoiceMaterial[i].amount) / parseFloat(objInvoiceMaterial[i].quantity);//added 2016.03.16

						sublistMaterialTicket.setLineItemValue('custpage_checkbox', line, 'T');
						sublistMaterialTicket.setLineItemValue('custpage_item_number', line, objInvoiceMaterial[i].item);
						sublistMaterialTicket.setLineItemValue('custpage_description', line, objInvoiceMaterial[i].memo);
						sublistMaterialTicket.setLineItemValue('custpage_unit', line, objInvoiceMaterial[i].unit);
						sublistMaterialTicket.setLineItemValue('custpage_quantity', line, objInvoiceMaterial[i].quantity);
						sublistMaterialTicket.setLineItemValue('custpage_unit_price', line, parseFloat(rate).toFixed(2));
						sublistMaterialTicket.setLineItemValue('custpage_line_total', line, objInvoiceMaterial[i].amount);
					}


					for(var i in objInvoiceMaterial){
						var amount = objInvoiceMaterial[i].amount;
						totalAmount = parseFloat(totalAmount) + parseFloat(amount);
					}
				}

				if(generateNonInventoryItems){
					//Material Ticket

					var fCount = sublistMaterialTicket.getLineItemCount();
					if(fCount < 0){ fCount = 0;	}

					for (var i = 0; i < nonInventoryItems.length; i++){
						var line = i + 1 + fCount;
						LogMsg('Line: ' + line + ' | Non-Inventory Items: ' + nonInventoryItems[i].data[0].item_display);

						var rate = parseFloat(nonInventoryItems[i].data[0].amount) / parseFloat(nonInventoryItems[i].data[0].quantity);//added 2016.03.16

						sublistMaterialTicket.setLineItemValue('custpage_checkbox', line, 'T');
						sublistMaterialTicket.setLineItemValue('custpage_item_number', line, nonInventoryItems[i].data[0].item_display);
						sublistMaterialTicket.setLineItemValue('custpage_description', line,  nonInventoryItems[i].data[0].desc);
						sublistMaterialTicket.setLineItemValue('custpage_unit', line, nonInventoryItems[i].data[0].units_display);
						sublistMaterialTicket.setLineItemValue('custpage_quantity', line, nonInventoryItems[i].data[0].quantity);
						sublistMaterialTicket.setLineItemValue('custpage_unit_price', line, parseFloat(rate).toFixed(2));
						sublistMaterialTicket.setLineItemValue('custpage_line_total', line, getNum(nonInventoryItems[i].data[0].amount));
					}


					for(var i in nonInventoryItems){
						var amount = nonInventoryItems[i].data[0].amount;
						totalAmount = parseFloat(totalAmount) + parseFloat(amount);
					}
				}

				if(generateBillableItems){
					//Material Ticket

					var fCount = sublistMaterialTicket.getLineItemCount();
					if(fCount < 0){ fCount = 0;	}

					for (var i = 0; i < objInvoiceBillableItems.length; i++){
						
						var line = i + 1 + fCount;
						LogMsg('Line: ' + line + ' | BillableItems: ' + objInvoiceBillableItems[i].categorydisp);

						var rate = parseFloat(getNum(objInvoiceBillableItems[i].amount)) / parseFloat(1);//added 2016.03.16

						sublistMaterialTicket.setLineItemValue('custpage_checkbox', line, 'T');
						sublistMaterialTicket.setLineItemValue('custpage_item_number', line, objInvoiceBillableItems[i].categorydisp);
						sublistMaterialTicket.setLineItemValue('custpage_description', line, '');
						sublistMaterialTicket.setLineItemValue('custpage_unit', line, '');
						sublistMaterialTicket.setLineItemValue('custpage_quantity', line, '');
						sublistMaterialTicket.setLineItemValue('custpage_unit_price', line, '');
						sublistMaterialTicket.setLineItemValue('custpage_line_total', line, objInvoiceBillableItems[i].amount);
					}


					for(var i in objInvoiceBillableItems){
						var amount = objInvoiceBillableItems[i].amount;
						totalAmount = parseFloat(totalAmount) + parseFloat(amount);
					}
				}

				if(generateMarkUp){
					//Material Ticket

					var fCount = sublistMaterialTicket.getLineItemCount();
					if(fCount < 0){ fCount = 0;	}

					for (var i = 0; i < markup.length; i++){
						var line = i + 1 + fCount;
						LogMsg('Line: ' + line + ' | BillableItems: ' + markup[i].data[0].item_display);

						var rate = parseFloat(markup[i].data[0].amount) / parseFloat(1);//added 2016.03.16

						sublistMaterialTicket.setLineItemValue('custpage_checkbox', line, 'T');
						sublistMaterialTicket.setLineItemValue('custpage_item_number', line, markup[i].data[0].item_display);
						sublistMaterialTicket.setLineItemValue('custpage_description', line, '');
						sublistMaterialTicket.setLineItemValue('custpage_unit', line, markup[i].data[0].units_display);
						sublistMaterialTicket.setLineItemValue('custpage_quantity', line, '');
						sublistMaterialTicket.setLineItemValue('custpage_unit_price', line, parseFloat(rate).toFixed(2));
						sublistMaterialTicket.setLineItemValue('custpage_line_total', line, markup[i].data[0].amount);
					}


					for(var i in markup){
						var amount = markup[i].data[0].amount;
						totalAmount = parseFloat(totalAmount) + parseFloat(amount);
					}
				}

				if(generateDiscount){
					//Material Ticket

					var fCount = sublistMaterialTicket.getLineItemCount();
					if(fCount < 0){ fCount = 0;	}

					for (var i = 0; i < discount.length; i++){
						var line = i + 1 + fCount;
						LogMsg('Line: ' + line + ' | Discount: ' + discount[i].data[0].item_display);

						var rate = parseFloat(discount[i].data[0].amount) / parseFloat(1);//added 2016.03.16

						sublistMaterialTicket.setLineItemValue('custpage_checkbox', line, 'T');
						sublistMaterialTicket.setLineItemValue('custpage_item_number', line, discount[i].data[0].item_display);
						sublistMaterialTicket.setLineItemValue('custpage_description', line, '');
						sublistMaterialTicket.setLineItemValue('custpage_unit', line, discount[i].data[0].units_display);
						sublistMaterialTicket.setLineItemValue('custpage_quantity', line, '');
						sublistMaterialTicket.setLineItemValue('custpage_unit_price', line, parseFloat(rate).toFixed(2));
						sublistMaterialTicket.setLineItemValue('custpage_line_total', line, discount[i].data[0].amount);
					}


					for(var i in discount){
						var amount = discount[i].data[0].amount;
						totalAmount = parseFloat(totalAmount) + parseFloat(amount);
					}
				}

				if(generateFreightOtherCharges){

					var fCount = sublistMaterialTicket.getLineItemCount();
			
					if(fCount < 0){ fCount = 0;	}

					for (var i = 0; i < freightOthers.length; i++){
						var line = i + 1 + fCount;
						LogMsg('Line: ' + line + ' | Freight: ' + item_show);
						
						var invoice_display = freightOthers[i].data[0].invoice_display;
						var item_display = freightOthers[i].data[0].item_display;
						
						var item_show;
						
						if(invoice_display == null){
							item_show = item_display;
						}
						else{
							item_show = invoice_display;
						}						
						
						sublistMaterialTicket.setLineItemValue('custpage_checkbox', line, 'T');
						sublistMaterialTicket.setLineItemValue('custpage_item_number', line, item_show);
						sublistMaterialTicket.setLineItemValue('custpage_description', line, '');
						sublistMaterialTicket.setLineItemValue('custpage_unit', line, '');
						sublistMaterialTicket.setLineItemValue('custpage_quantity', line, '');
						sublistMaterialTicket.setLineItemValue('custpage_unit_price', line, '');
						sublistMaterialTicket.setLineItemValue('custpage_line_total', line, freightOthers[i].data[0].amount);
					}


					for(var i in freightOthers){
						var amount = freightOthers[i].data[0].amount;
						totalAmount = parseFloat(totalAmount) + parseFloat(amount);
					}

				}


				//Total Amount
				var countSublist = sublistMaterialTicket.getLineItemCount();
				var lastRow = countSublist + 1;

				sublistMaterialTicket.setLineItemValue('custpage_checkbox', lastRow, 'F');
				sublistMaterialTicket.setLineItemValue('custpage_item_number', lastRow, '');
				sublistMaterialTicket.setLineItemValue('custpage_description', lastRow, '');
				sublistMaterialTicket.setLineItemValue('custpage_unit', lastRow, '');
				sublistMaterialTicket.setLineItemValue('custpage_quantity', lastRow, '');
				sublistMaterialTicket.setLineItemValue('custpage_unit_price', lastRow, '');
				sublistMaterialTicket.setLineItemValue('custpage_line_total', lastRow, totalAmount.toFixed(2));

			}

			else{

				LogMsg('No Search Result')

				//Fields
				var fieldInvoice = form.addField('custpage_invoice', 'text', 'Search Invoice');
				fieldInvoice.setDefaultValue(invoiceId);
				fieldInvoice.setLayoutType('startrow');

				var fieldInvoice = form.addField('custpage_msg', 'inlinehtml', '');
				fieldInvoice.setDefaultValue('Invoice: ' + invoiceId + ' does not have material items/labor ticket num.');

			}

		}

		form.addSubmitButton('Search');
		response.writePage(form);
	}
}

var objCompanyInformation = function(){
	var obj = {};
	var companyInfo = nlapiLoadConfiguration('companyinformation');
	var field = companyInfo.getAllFields();
	for(var i in field){
		var f = field[i];
		var v = companyInfo.getFieldValue(f);
		obj[f] = v;
	}
	return obj;
}

var getInvoiceMaterial = function(invoiceNum){
	var result = [];
	var filters =
	[
		new nlobjSearchFilter('tranId', null, 'is', invoiceNum)
	];

	var s = nlapiSearchRecord('invoice','customsearch_material_ticket', filters, null);
	if(s != null)
	{
		for (var i = 0; i < s.length; i++)
		{
			var trandate = s[i].getValue('trandate');
			var billaddress = s[i].getValue('billaddress');
			var tranid = s[i].getValue('tranid');
			var entity = s[i].getValue('entity');
			var unit = s[i].getValue('unit');

			var item;
			var itemname = s[i].getText('item');
			var invdisplayname = s[i].getValue('custcol_invdisplayname');

			if(invdisplayname != ""){
				item = invdisplayname;
			}
			else{
				item = itemname;
			}

			var memo = s[i].getValue('memo');
			//var quantity = s[i].getValue('quantity');//Changed 2016.03.16
			var quantity = s[i].getValue('quantityuom');
			var rate = getNum(s[i].getValue('rate'));
			var amount = getNum(s[i].getValue('amount'));
			var taxamount = getNum(s[i].getValue('taxamount'));

			var formulacurrency = s[i].getValue('formulacurrency');
			var billaddressee = s[i].getValue('billaddressee');
			var billaddress1 = s[i].getValue('billaddress1');
			var billaddress2 = s[i].getValue('billaddress2');
			var billaddress3 = s[i].getValue('billaddress3');
			var billcity = s[i].getValue('billcity');
			var billstate = s[i].getValue('billstate');
			var billzip = s[i].getValue('billzip');
			var billcountry = s[i].getText('billcountry');

			result.push
			(
				{
					'trandate' : trandate,
					'billaddress' : billaddress,
					'tranid' : tranid,
					'entity' : entity,
					'item' : item,
					'memo' : memo,
					'quantity' : quantity,
					'rate' : rate,
					'unit' : unit,
					'amount' : amount,
					'taxamount' : taxamount,
					'formulacurrency' : formulacurrency,
					'billaddressee' : billaddressee,
					'billaddress1' : billaddress1,
					'billaddress2' : billaddress2,
					'billaddress3' : billaddress3,
					'billcity' : billcity,
					'billstate' : billstate,
					'billzip' : billzip,
					'billcountry' : billcountry,
				}
			);

			LogMsg('MATERIAL ITEMS ---- Item: ' + item + ' | Amount: ' + amount);
		}
	}
	return result;
}

var getHeaderFields = function(invoiceId){
	
	var header = [];

	var filters =
	[
		new nlobjSearchFilter('tranid', null, 'is', invoiceId),
		new nlobjSearchFilter('mainline', null, 'is', 'T', null)
	];

	var s = nlapiSearchRecord('invoice',null, filters, null);

	if(s != null){
		
		var id = s[0].getId();
		
		if(invoiceId != null){

			var obj = nlapiLoadRecord('invoice', id);
			
			var trandate = obj.getFieldValue('trandate');
			var tranid = obj.getFieldValue('tranid');
			var entity = obj.getFieldValue('entity');
			var memo = obj.getFieldValue('memo');
			var billaddressee = obj.getFieldValue('billaddressee');
			var billaddr1 = obj.getFieldValue('billaddr1');
			var billaddr2 = obj.getFieldValue('billaddr2');
			var billaddr3 = obj.getFieldValue('billaddr3');
			var billcity = obj.getFieldValue('billcity');
			var billstate = obj.getFieldValue('billstate');
			var billzip = obj.getFieldValue('billzip');
			var billcountry = obj.getFieldValue('billcountry');
			var billAddress = obj.getFieldValue('billaddress');
			
			header.push
			(
				{
					'trandate' : trandate,
					'tranid' : tranid,
					'entity' : entity,
					'memo' : memo,
					'billAddress' : billAddress,
					'billaddressee' : billaddressee,
					'billaddr1' : billaddr1,
					'billcity' : billcity,
					'billstate' : billstate,
					'billzip' : billzip,
					'billcountry' : billcountry,
					'billaddr2' : billaddr2,
					'billaddr3' : billaddr3
				}
			);			
		}
	}
	
	return header;
}

//Client Function -----------------------------------------------------------
var download = function(){

	var count = nlapiGetLineItemCount('custpage_sublist_material_ticket');

	var arr = "";
	for (var i = 0; i < count; i++){
		var z = i + 1;
		var val = nlapiGetLineItemValue('custpage_sublist_material_ticket', 'custpage_checkbox', z);
		arr += val + ',';
	}

	nlapiSetFieldValue('custpage_hidden', 'T');
	var hidden = nlapiGetFieldValue('custpage_hidden');

	var invoiceId = nlapiGetFieldValue('custpage_hidden_invoice_id');

	var environment = "https://system.na1.netsuite.com";
	var fileLink = environment + nlapiResolveURL('SUITELET', 'customscript_upy_suitelet_invoice_pdf', 'customdeploy_upy_suitelet_invoice_pdf') + '&pdf=T&items=' + arr + '&invoiceId=' + invoiceId;
	window.open(fileLink, "_blank");
}

//XML
var xmlDeclaration = function(){
	return "<?xml version='1.0' encoding='UTF-8'?><!DOCTYPE pdf PUBLIC '-//big.faceless.org//report' 'report-1.1.dtd'>";
}

var header = function(stylesheet){
	var xml = "<head>";
	xml += stylesheet;
	xml += "</head>";
	return xml;
}

var body = function(content){
	var xml = "<body>";
	xml += content;
	xml += "</body>";
	return xml;
}

var getInvoiceLabor = function(invoiceId){

	var labor = [];

	var filters =
	[
		new nlobjSearchFilter('tranid', null, 'is', invoiceId),
		new nlobjSearchFilter('mainline', null, 'is', 'T', null)
	];

	var s = nlapiSearchRecord('invoice',null, filters, null);

	if(s != null){
		var id = s[0].getId();

		var objInvLaborMaterial = nlapiLoadRecord('invoice', id);
		var timeCount = objInvLaborMaterial.getLineItemCount('time');
		var tranId = objInvLaborMaterial.getFieldValue('tranid');
		var billaddress = objInvLaborMaterial.getFieldValue('billaddress');
		var trandate = objInvLaborMaterial.getFieldValue('trandate');

		for (var i = 1; i <= timeCount; i++){

			var apply = objInvLaborMaterial.getLineItemValue('time', 'apply', i);
			var amount = getNum(objInvLaborMaterial.getLineItemValue('time', 'amount', i));
			var doc = objInvLaborMaterial.getLineItemValue('time', 'doc', i);
			var ticketnum = objInvLaborMaterial.getLineItemValue('time', 'custcol_ticket_number', i);


			if(apply == 'T'){
				labor.push
				(
						{
							'tranid' : tranId,
							'billaddress' : billaddress,
							'trandate' : trandate,
							'doc' : doc,
							'amount' : amount,
							'ticketnum' : ticketnum
						}
				);
			}
		}
	}

	var newArr = [];

	for (i = 0; i < labor.length; i++) {
	  var found = false;
	  for (newArrIterator = 0; newArrIterator < i; newArrIterator++) {
	    if (newArr[newArrIterator] && newArr[newArrIterator].label === labor[i].label) {
	      newArr[newArrIterator].amount = (parseFloat(newArr[newArrIterator].amount) + parseFloat(labor[i].amount)).toString()
	      found = true
	    }
	  }

	  if (!found) {
	    newArr.push(labor[i]);
	  }
	}

	return newArr;
}

var comma = function(nStr) {
    nStr += '';
    x = nStr.split('.');
    x1 = x[0];
    x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }
    return x1 + x2;
}

var getPST = function(invoiceNum){
	var result = [];
	var pst = parseFloat("0.00");
	var filters =
	[
		new nlobjSearchFilter('tranId', null, 'is', invoiceNum)
	];
	var s = nlapiSearchRecord('invoice','customsearch_invoice_gl_impact', filters, null);
	if(s != null)
	{
		for (var i = 0; i < s.length; i++)
		{
			var amount = parseFloat(getNum(s[i].getValue('creditamount')));
			var account = s[i].getValue('account');

			//PST Payable - GR = 91; PST Payable AB = 112; PST Payable MB = 460; PST Payable SK = 150; PST Payable BC = 455
			if(account == '91' || account == '112' || account == '460' || account == '150' || account == '455')
			{
				if(!isNaN(amount)){
					pst = parseFloat(pst) + parseFloat(amount);
				}
			}
		}
	}
	return pst;
}

var getGST = function(invoiceNum){

	var itemArray = [];

	var filters =
	[
		new nlobjSearchFilter('tranId', null, 'is', invoiceNum)
	];

	var s = nlapiSearchRecord('invoice',null, filters, null);

	var invoiceId = s[0].getId();

	if(invoiceId != null){

		var obj = nlapiLoadRecord('invoice', invoiceId);

		//if(isBlank(obj)) return false;
		var count = obj.getLineItemCount('item');

		if(count > 0){
			for(var i = 1; i <= count; i++)
			{
				var taxrate1 = getNum(obj.getLineItemValue('item', 'taxrate1', i)); //percentage
				var amount = getNum(obj.getLineItemValue('item', 'amount', i)); //amount
				var item = obj.getLineItemValue('item', 'item', i); //item
				var line = obj.getLineItemValue('item', 'line', i); //line
				var taxamount;

				if(taxrate1 != null){
					taxamount = parseFloat(taxrate1)/100 * parseFloat(amount);
				}

				itemArray.push
				(
					{
						'taxrate1' : taxrate1,
						'amount' : amount,
						'item' : item,
						'line' : line,
						'taxamount' : taxamount
					}
				);
			}
		}
	}

	var totalTax = parseFloat(0.0);

	for(var i in itemArray){
		totalTax = parseFloat(getNum(itemArray[i].taxamount)) + totalTax;
	}

	return totalTax.toFixed(2);
}

var getEnvironmentURL=function(){var a=nlapiGetContext().getEnvironment();"PRODUCTION"==a?environment="https://system.netsuite.com":"SANDBOX"==a&&(environment="https://system.sandbox.netsuite.com");return environment};

var getFreightOtherCharges = function(invoiceNum){

	var OtherCharges = [];

	var filters =
	[
		new nlobjSearchFilter('tranId', null, 'is', invoiceNum)
	];

	var s = nlapiSearchRecord('invoice',null, filters, null);

	var invoiceId = s[0].getId();

	if(invoiceId != null){

		var obj = nlapiLoadRecord('invoice', invoiceId);

		//if(isBlank(obj)) return false;
		var count = obj.getLineItemCount('item');

		if(count > 0){
			for(var i = 1; i <= count; i++)
			{
		        var tax;
		        var taxamount;				
				var itemtype = obj.getLineItemValue('item', 'itemtype', i); //Type
				var item_display = obj.getLineItemValue('item', 'item_display', i); //percentage
				var units_display = obj.getLineItemValue('item', 'units_display', i);
				var amount = getNum(obj.getLineItemValue('item', 'amount', i)); //amount
				var taxrate1 = obj.getLineItemValue('item', 'taxrate1', i); //amount
				var taxrate2 = obj.getLineItemValue('item', 'taxrate2', i); //amount
				
		        taxrate1 = taxrate1.replace(/\d+% ?/g, "");
		        taxrate2 = taxrate2.replace(/\d+% ?/g, "");

		        if(taxrate1 > 0)
		        {
		          taxamount = (parseFloat(getNum(amount)) * parseFloat(taxrate1))/100;
		        }
		        else if(taxrate2 > 0)
		        {
		          taxamount = (parseFloat(getNum(amount)) * parseFloat(taxrate2))/100;  
		        }
		        
				var invoice_display = obj.getLineItemValue('item', 'custcol_invdisplayname', i); //invoice display

				if(itemtype == "OthCharge"){

					OtherCharges.push
					(
						{
							'itemtype' : itemtype,
							'item_display' :item_display,
							'units_display' : units_display,
							'amount' : amount,
							'taxrate1' : taxrate1,
							'taxamount' : taxamount.toFixed(2),
							'invoice_display' : invoice_display
						}
					);

					LogMsg('FREIGHT OTHER CHARGES ---- Item: ' + item_display + ' | Amount: ' + amount);
				}

			}
		}
	}

	return groupBy(OtherCharges, 'item_display');
}

var getBillableItems = function(invoiceNum){

	var BillableItems = [];

	var filters =
	[
		new nlobjSearchFilter('tranId', null, 'is', invoiceNum)
	];

	var s = nlapiSearchRecord('invoice',null, filters, null);

	var invoiceId = s[0].getId();

	if(invoiceId != null){

		var obj = nlapiLoadRecord('invoice', invoiceId);
		var count = obj.getLineItemCount('expcost');

		if(count > 0){
			for(var i = 1; i <= count; i++)
			{
				var taxrate1;
				var taxrate2; 
				var taxamount;
				var categorydisp = obj.getLineItemValue('expcost', 'categorydisp', i);
				var amount = getNum(obj.getLineItemValue('expcost', 'amount', i));
				taxrate1 = obj.getLineItemValue('expcost', 'taxrate1', i);
				taxrate2 = obj.getLineItemValue('expcost', 'taxrate2', i);
				var line = getNum(obj.getLineItemValue('expcost', 'line', i));
				var invoice_display = obj.getLineItemValue('expcost', 'custcol_invdisplayname', i);
				var doc = obj.getLineItemValue('expcost', 'doc', i);
				
				var showitem;
				
				if(!isBlank(invoice_display)){
					showitem = invoice_display;
				}
				else{
					showitem = categorydisp;
				}
				
				if(!isBlank(taxrate1))
				{
					taxrate1 = taxrate1.replace(/\d+% ?/g, "");
				}
				else
				{
					taxrate1 = 0;
				}
				
				if(!isBlank(taxrate2))
				{
					taxrate2 = taxrate2.replace(/\d+% ?/g, "");
				}				
				else
				{
					taxrate2 = 0;
				}
				
		        if(taxrate1 > 0)
		        {
		          taxamount = (parseFloat(getNum(amount)) * parseFloat(taxrate1))/100;
		        }
		        else if(taxrate2 > 0)
		        {
		          taxamount = (parseFloat(getNum(amount)) * parseFloat(taxrate2))/100;  
		        }
		        else
		        {
		          taxamount = 0;
		        }
				
				
				var memo = obj.getLineItemValue('expcost', 'memo', i);

				BillableItems.push
				(
					{
						'categorydisp': showitem,
						'amount' : amount,
						'taxrate1' : taxrate1,
						'taxrate2' : taxrate2,
						'taxamount' : taxamount.toFixed(2),
						'memo' : memo,
						'doc' : doc
					}
				);

				LogMsg('BILLABLE ITEMS ---- Item: ' + categorydisp + ' | Amount: ' + amount);

			}
		}
	}

	return BillableItems;
}

var getMarkUp = function(invoiceNum){

	var MarkUp = [];

	var filters =
	[
		new nlobjSearchFilter('tranId', null, 'is', invoiceNum)
	];

	var s = nlapiSearchRecord('invoice',null, filters, null);

	var invoiceId = s[0].getId();

	if(invoiceId != null){

		var obj = nlapiLoadRecord('invoice', invoiceId);

		//if(isBlank(obj)) return false;
		var count = obj.getLineItemCount('item');

		if(count > 0){
			for(var i = 1; i <= count; i++)
			{
				var itemtype = obj.getLineItemValue('item', 'itemtype', i); //Type
				var item_display = obj.getLineItemValue('item', 'item_display', i); //percentage
				var units_display = obj.getLineItemValue('item', 'units_display', i);
				var amount = getNum(obj.getLineItemValue('item', 'amount', i)); //amount
				var taxrate1 = getNum(obj.getLineItemValue('item', 'taxrate1', i)); //amount
				if(!isBlank(taxrate1))
				{
					s = taxrate1.replace(/\d+% ?/g, "");	
				}
				else
				{
					s = 5.00;
				}				
				var taxamount = (parseFloat(amount) * parseFloat(s))/100;

				if(itemtype == "Markup"){

					MarkUp.push
					(
						{
							'itemtype' : itemtype,
							'item_display' :item_display,
							'units_display' : units_display,
							'amount' : amount,
							'taxrate1' : taxrate1,
							'taxamount' : taxamount.toFixed(2),
						}
					);

					LogMsg('MARK UP CHARGES ---- Item: ' + item_display + ' | Amount: ' + amount);
				}

			}
		}
	}

	return groupBy(MarkUp, 'item_display');
}

var getDiscount = function(invoiceNum){

	var Discount = [];

	var filters =
	[
		new nlobjSearchFilter('tranId', null, 'is', invoiceNum)
	];

	var s = nlapiSearchRecord('invoice',null, filters, null);

	var invoiceId = s[0].getId();

	if(invoiceId != null){

		var obj = nlapiLoadRecord('invoice', invoiceId);

		//if(isBlank(obj)) return false;
		var count = obj.getLineItemCount('item');

		if(count > 0){
			for(var i = 1; i <= count; i++)
			{
				var itemtype = obj.getLineItemValue('item', 'itemtype', i); //Type
				var item_display = obj.getLineItemValue('item', 'item_display', i); //percentage
				var units_display = obj.getLineItemValue('item', 'units_display', i);
				var amount = getNum(obj.getLineItemValue('item', 'amount', i)); //amount
				var taxrate1 = getNum(obj.getLineItemValue('item', 'taxrate1', i)); //amount
				
				if(!isBlank(taxrate1))
				{
					s = taxrate1.replace(/\d+% ?/g, "");	
				}
				else
				{
					s = 5.00;
				}
				var taxamount = (parseFloat(amount) * parseFloat(s))/100;

				if(itemtype == "Discount"){

					Discount.push
					(
						{
							'itemtype' : itemtype,
							'item_display' :item_display,
							'units_display' : units_display,
							'amount' : amount,
							'taxrate1' : taxrate1,
							'taxamount' : taxamount.toFixed(2),
						}
					);

					LogMsg('DISCOUNT UP CHARGES ---- Item: ' + item_display + ' | Amount: ' + amount);
				}

			}
		}
	}

	return groupBy(Discount, 'item_display');
}


var groupLaborCharge = function(invoiceNum){

	var groupLaborArr = [];
	var laborChargesArr = getLaborCharges(invoiceNum);

	if(laborChargesArr != null && laborChargesArr.length > 0){

		var sum = 0;

		for(var i in laborChargesArr){

			var sum = parseFloat(0);
			for(var z in laborChargesArr[i].data){
				var total = getNum(laborChargesArr[i].data[z].total);
				if(isNaN(total)){
					total = 0;
				}
				sum = parseFloat(sum) + parseFloat(total);
			}

			groupLaborArr.push
			(
				{
					'ticket' : laborChargesArr[i].type,
					'sum' : sum
				}
			);

			LogMsg('LABOR ITEMS ---- Ticket: ' + laborChargesArr[i].type + ' | Sum: ' + sum);
		}
	}

	return groupLaborArr;
}

var getLaborCharges = function(invoiceNum){

	var laborCharges = [];

	var filters =
	[
		new nlobjSearchFilter('tranId', null, 'is', invoiceNum)
	];

	var s = nlapiSearchRecord('invoice', 'customsearch_project_invoice', filters, null);

	if(s != null)
	{
		for (var i = 0; i < s.length; i++)
		{
			var type = s[i].getValue('type', 'item');
			var ticket = s[i].getValue('custcol_ticket_number');
			var quantity = s[i].getValue('quantity');
			var rate = getNum(s[i].getValue('rate'));

			var total = parseFloat(rate) * parseFloat(quantity);

			if(type == 'Service'){
				laborCharges.push
				(
					{
						'ticket' : ticket,
						'type' : type,
						'quantity' : quantity,
						'rate' : rate,
						'total' : total
					}
				);
			}
		}
	}
	return groupBy(laborCharges, 'ticket');
}


var getNonInventory = function(invoiceNum){

	var NonInvPart = [];

	var filters =
	[
		new nlobjSearchFilter('tranId', null, 'is', invoiceNum)
	];

	var s = nlapiSearchRecord('invoice',null, filters, null);

	var invoiceId = s[0].getId();

	if(invoiceId != null){

		var obj = nlapiLoadRecord('invoice', invoiceId);

		//if(isBlank(obj)) return false;
		var count = obj.getLineItemCount('item');

		if(count > 0){
			for(var i = 1; i <= count; i++)
			{
				var itemtype = obj.getLineItemValue('item', 'itemtype', i); //Type
				var item_display = obj.getLineItemValue('item', 'item_display', i); //percentage
				var units_display = obj.getLineItemValue('item', 'units_display', i);
				var quantity = getNum(obj.getLineItemValue('item', 'quantity', i)); //quantity
				var desc = obj.getLineItemValue('item', 'description', i); //description
				var amount = getNum(obj.getLineItemValue('item', 'amount', i)); //amount
				var rate = getNum(obj.getLineItemValue('item', 'rate', i)); //amount
				var taxrate1 = getNum(obj.getLineItemValue('item', 'taxrate1', i)); //amount
				var invoice_display = obj.getLineItemValue('item', 'custcol_invdisplayname', i); //invoice display
				var line = obj.getLineItemValue('item', 'line', i);
				
				var showtime;
				
				if(!isBlank(invoice_display)){
					showitem = invoice_display;
				}
				else{
					showitem = item_display;
				}
				
				
				if(!isBlank(taxrate1))
				{
					s = taxrate1.replace(/\d+% ?/g, "");	
				}
				else
				{
					s = 5.00;
				}
				var taxamount = (parseFloat(amount) * parseFloat(s))/100;
				var projCost = obj.getLineItemValue('item', 'custcol_upaya_cost_category_item', i);

				if(itemtype == "NonInvtPart"){
					if(projCost != "1")//Exclude Non-Inventory Materials
					{
						NonInvPart.push
						(
							{
								'itemtype' : itemtype,
								'item_display' :showitem,
								'units_display' : units_display,
								'quantity' : quantity,
								'desc' : desc,
								'amount' : amount,
								'rate' : rate,
								'taxrate1' : taxrate1,
								'taxamount' : taxamount.toFixed(2),
								'line' : line
							}
						);
					}

					LogMsg('NON-INVENTORY ITEMS ---- Item: ' + item_display + ' | Amount: ' + amount);
				}

			}
		}
	}
	
	return groupBy(NonInvPart, 'line');
}

var esc = function(e){
	return nlapiEscapeXML(e);
}
function isBlank(test){ if ( (test == '') || (test == null) ||(test == undefined) || (test.toString().charCodeAt() == 32)  ){return true}else{return false}}

function groupBy(arr, key) {
    var newArr = [],
        types = {},
        newItem, i, j, cur;
    for (i = 0, j = arr.length; i < j; i++) {
        cur = arr[i];
        if (!(cur[key] in types)) {
            types[cur[key]] = { type: cur[key], data: [] };
            newArr.push(types[cur[key]]);
        }
        types[cur[key]].data.push(cur);
    }
    return newArr;
}


var getLaborChargesHeaderFields = function(invoiceNum){

	var laborCharges = [];

	var filters =
	[
		new nlobjSearchFilter('tranId', null, 'is', invoiceNum)
	];

	var s = nlapiSearchRecord('invoice', 'customsearch_project_invoice', filters, null);

	if(s != null)
	{
		var clientlocation = s[0].getValue('custentity__clientlocation', 'job');
		var projectdescription = s[0].getValue('custentity_projectdescription', 'job');
		var afenumber = s[0].getValue('custentity_afenumber', 'job');
		var costcode = s[0].getValue('custentity_costcode', 'job');
		var contractnumber = s[0].getValue('custentity_contractnumber', 'job');
		var superintendent = s[0].getValue('custentity_superintendent', 'job');
		var cwpnumber = s[0].getValue('custentity_cwpnumber', 'job');
		var changeordernum = s[0].getValue('custentity_changeordernum', 'job');
		var projectNum = s[0].getValue('entityid', 'job');

		laborCharges.push
		(
			{
				'clientlocation' : clientlocation,
				'projectdescription' : projectdescription,
				'afenumber' : afenumber,
				'costcode' : costcode,
				'contractnumber' : contractnumber,
				'superintendent' : superintendent,
				'cwpnumber' : cwpnumber,
				'changeordernum' : changeordernum,
				'projectNum' : projectNum
			}
		);

	}

	return laborCharges;
}

function getNum(val) {
   if (isNaN(val) || val == null) {
     return 0;
   }
   return val;
}

var getState = function(invoiceNum)
{
	
	var filters =
	[
		new nlobjSearchFilter('tranId', null, 'is', invoiceNum)
	];

	var s = nlapiSearchRecord('invoice',null, filters, null);

	var invoiceId = s[0].getId();	
	//shipstate
	var shipState = nlapiLookupField('transaction', invoiceId, 'shipstate');
	//billstate
	var billState = nlapiLookupField('transaction', invoiceId, 'billstate');
	
	return shipState;
}