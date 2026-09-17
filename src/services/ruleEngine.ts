import {
  CropType,
  ImageAnalysisMetrics,
  LanguageCode,
  QuestionnaireAnswers,
  RecommendationResult,
  StatusColor,
  WeatherData
} from '../types';

export function evaluateFieldDiagnosis(
  metrics: ImageAnalysisMetrics,
  answers: QuestionnaireAnswers,
  cropType: CropType,
  plotAreaAcre: number = 1.0,
  weather?: WeatherData,
  lang: LanguageCode = 'en'
): RecommendationResult {
  let fertilizerStatus: StatusColor = 'green';
  let fertilizerTitle = 'Good fertilizer level';
  let fertilizerAction = 'Maintain current dosage. Plants have optimal nitrogen nutrition.';

  let waterStatus: StatusColor = 'green';
  let waterTitle = 'Optimal soil moisture';
  let waterAction = 'Soil holds sufficient moisture. No irrigation needed today.';

  let costHint = 'Current input schedule is cost-efficient. No wasted expenses.';
  let yieldHint = 'You are on track to protect full projected harvest yield.';

  // Bachat (Savings) metrics based on acres
  const baseArea = Math.max(0.25, plotAreaAcre || 1.0);
  let ureaBagsSaved = 0;
  let dapBagsSaved = 0;
  let pumpingHoursSaved = 0;
  let estimatedCashSaved = 0;

  // --- 1. EVALUATE WATER STATUS ---
  // Signals: soilMoistureLevel ('dry' | 'moist' | 'wet'), soilBrightness, answers.recentRain
  const isSoilDry = metrics.soilMoistureLevel === 'dry' || metrics.soilBrightness > 48;
  const isSoilWaterlogged = metrics.soilMoistureLevel === 'wet' && metrics.soilBrightness < 24;

  if (isSoilDry) {
    if (!answers.recentRain) {
      waterStatus = 'red';
      waterTitle = lang === 'hi' ? 'गंभीर सूखा - तुरंत पानी दें' : 'Too little water – urgent deficit';
      waterAction = lang === 'hi'
        ? 'मिट्टी सूखी है और 3 दिन से पानी नहीं मिला। फसल सूखने से पहले आज ही पानी दें।'
        : 'Topsoil is parched and no recent rain. Irrigate plot within 24 hours to prevent wilting.';
      yieldHint = lang === 'hi'
        ? 'पानी में देरी से पैदावार 10% से 20% तक घट सकती है।'
        : 'Delaying irrigation may reduce final crop yield by 10% to 20%.';
      costHint = lang === 'hi'
        ? 'सूखी जमीन में खाद बेकार चली जाएगी, पानी देना सबसे जरूरी है।'
        : 'Water immediately so existing fertilizer can dissolve and be absorbed.';
    } else {
      waterStatus = 'yellow';
      waterTitle = lang === 'hi' ? 'मध्यम नमी - निगरानी रखें' : 'Borderline moisture';
      waterAction = lang === 'hi'
        ? 'हाल ही में पानी मिला था पर ऊपरी सतह सूख रही है। कल शाम तक फिर से जांचें।'
        : 'Moisture is declining despite recent rain. Monitor soil depth before next run.';
      yieldHint = lang === 'hi'
        ? 'हल्की सिंचाई से 5% पैदावार नुकसान बचाया जा सकता है।'
        : 'Timely light irrigation protects 5–10% harvest volume.';
    }
  } else if (isSoilWaterlogged) {
    waterStatus = 'red';
    waterTitle = lang === 'hi' ? 'ज्यादा पानी - जलभराव का खतरा' : 'Too much water – waterlogging risk';
    waterAction = lang === 'hi'
      ? 'खेत में पानी ज्यादा है। पानी निकासी की नाली खोलें ताकि जड़ें सड़े नहीं।'
      : 'Excess saturation detected. Drain standing water to prevent root suffocation.';
    pumpingHoursSaved += Math.round(baseArea * 4);
    estimatedCashSaved += Math.round(pumpingHoursSaved * 120); // diesel cost ~120/hr
    costHint = lang === 'hi'
      ? `ट्यूबवेल बंद रखें: लगभग ${pumpingHoursSaved} घंटे डीजल बचेंगे (~₹${estimatedCashSaved})!`
      : `Halt tube-well pumping: saves ~${pumpingHoursSaved} diesel pumping hours!`;
  } else {
    // Moist
    waterStatus = 'green';
    waterTitle = lang === 'hi' ? 'नमी एकदम सही है' : 'Good moisture balance';
    waterAction = lang === 'hi'
      ? 'मिट्टी में पर्याप्त नमी है। आज पानी देने का खर्च बचाने का सही समय है।'
      : 'Soil profile has adequate moisture. Keep pumps off to save fuel.';
    pumpingHoursSaved += Math.round(baseArea * 2.5);
    estimatedCashSaved += Math.round(pumpingHoursSaved * 120);
  }

  // --- 2. EVALUATE FERTILIZER STATUS ---
  // Signals: cropGreennessIndex, cropChlorosisRatio, answers.recentFertilizer, answers.visibleStress
  const hasNitrogenDeficiency = metrics.cropGreennessIndex < 0.33 || metrics.cropChlorosisRatio > 0.22 || answers.visibleStress;
  const isVegetationLushAndDark = metrics.cropGreennessIndex > 0.44 && metrics.cropChlorosisRatio < 0.05 && metrics.cropCanopyCoverage > 80;

  if (hasNitrogenDeficiency) {
    if (!answers.recentFertilizer) {
      fertilizerStatus = 'red';
      fertilizerTitle = lang === 'hi' ? 'खाद की भारी कमी (भूखे पौधे)' : 'Too little fertilizer – nutrients low';
      fertilizerAction = lang === 'hi'
        ? 'फसल को नाइट्रोजन की सख्त जरूरत है। हल्की खुराक में यूरिया का छिड़काव या टॉप-ड्रेस करें।'
        : 'Plants are starved of nitrogen. Apply recommended starter/top-dress fertilizer.';
      yieldHint = lang === 'hi'
        ? 'समय पर खाद न देने से पैदावार 15-25% कम हो सकती है।'
        : 'Uncorrected nutrient starvation can cause a 15–25% seasonal yield loss.';
      costHint = lang === 'hi'
        ? 'कम लागत में समय पर खाद देने से फसल को तुरंत पोषण मिलेगा।'
        : 'Targeted application now protects your entire season investment.';
    } else {
      // Applied recently but still yellow/stressed -> Could be root damage, pH or leaching
      fertilizerStatus = 'yellow';
      fertilizerTitle = lang === 'hi' ? 'खाद के बाद भी पीलापन - जाँचें' : 'Persistent stress – check roots';
      fertilizerAction = lang === 'hi'
        ? 'हाल ही में खाद दी गई है। और खाद न डालें, पानी का निकास या कीड़ों की जांच करें।'
        : 'Fertilizer was applied recently. Do not overdose; inspect roots for fungal rot or salinity.';
      ureaBagsSaved += Math.round(baseArea * 1);
      estimatedCashSaved += Math.round(ureaBagsSaved * 280); // Urea bag ~₹280
      costHint = lang === 'hi'
        ? `और खाद डालने से बचें: 1 बोरी यूरिया (~₹280) बचाई जा सकती है।`
        : 'Skip second unnecessary chemical dose: save 1 bag of fertilizer!';
    }
  } else if (isVegetationLushAndDark && answers.recentFertilizer) {
    // Excessive lush rank growth -> risk of lodging, disease and wasted money!
    fertilizerStatus = 'yellow';
    fertilizerTitle = lang === 'hi' ? 'ज़रूरत से ज़्यादा खाद (अति पोषण)' : 'Excessive fertilizer – reduce next dose';
    fertilizerAction = lang === 'hi'
      ? 'पत्ते बहुत गहरे हरे हैं और बढ़वार अधिक है। अगली खाद बिल्कुल न डालें।'
      : 'Crop is luxuriant with dark foliage. Reduce or skip next fertilizer dose to prevent lodging.';
    ureaBagsSaved += Math.round(baseArea * 1.5);
    dapBagsSaved += Math.round(baseArea * 0.5);
    const fertCash = Math.round(ureaBagsSaved * 280 + dapBagsSaved * 1350);
    estimatedCashSaved += fertCash;
    costHint = lang === 'hi'
      ? `सीधी बचत: अगली यूरिया/DAP बोरी न खरीदकर ₹${fertCash} बचाएं!`
      : `Pocket relief: Skip next top-dress to save ~${ureaBagsSaved} bags of Urea and cash!`;
    yieldHint = lang === 'hi'
      ? 'ज़्यादा खाद से पौधे गिर सकते हैं। खाद रोकने से फ़सल सुरक्षित रहेगी।'
      : 'Excess nitrogen makes stalks weak. Skipping protects against storm lodging.';
  } else {
    // Optimal green
    fertilizerStatus = 'green';
    fertilizerTitle = lang === 'hi' ? 'खाद का सही संतुलन' : 'Good fertilizer balance';
    fertilizerAction = lang === 'hi'
      ? 'फसल का हरापन और पत्तियां तंदुरुस्त हैं। अतिरिक्त खाद डालने की कोई आवश्यकता नहीं है।'
      : 'Canopy greenness index is optimal. Maintain current schedule without extra purchases.';
    ureaBagsSaved += Math.round(baseArea * 1);
    estimatedCashSaved += Math.round(ureaBagsSaved * 280);
    costHint = lang === 'hi'
      ? 'दुकानदार के बहकावे में न आएं, इस समय कोई अतिरिक्त खाद न खरीदें।'
      : 'No additional fertilizer purchase needed this week.';
  }

  // --- 3. DYNAMIC WEATHER CROSS-REFERENCE ---
  // If rainfall predicted in next 24-48h, dynamically alert farmer to PAUSE watering!
  let weatherWarning;
  if (weather && weather.rainExpectedNext48h) {
    const mm = weather.rainSumMm || 12;
    const prob = weather.rainProbabilityMax || 75;
    weatherWarning = {
      hasHeavyRainRisk: true,
      rainProbability: prob,
      predictedMm: mm,
      alertText: lang === 'hi'
        ? `गाँव में अगले 24-48 घंटों में बारिश (${prob}% संभावना, ~${mm}mm) का पूर्वानुमान है! ट्यूबवेल/नहर का पानी तुरंत रोकें, ताकि ₹${Math.round(baseArea * 350)} का डीजल बचे और खेत में जलभराव न हो।`
        : `Rain expected in 24–48 hours (${prob}% chance, ~${mm}mm). PAUSE irrigation! You will save diesel/electric pumping costs and protect root aeration.`
    };

    // If farmer was going to water, weather alert saves pumping money!
    if (waterStatus !== 'red' || answers.recentRain) {
      pumpingHoursSaved += Math.round(baseArea * 3);
      estimatedCashSaved += Math.round(baseArea * 360);
    }
  }

  // Ensure minimum savings representation for user delight
  if (estimatedCashSaved === 0) {
    estimatedCashSaved = Math.round(baseArea * 450);
  }

  // --- 4. GENERATE VOICE SCRIPT ---
  let voiceScript = '';
  if (lang === 'hi') {
    voiceScript = `नमस्ते किसान भाई! आपके ${cropType} के खेत में खाद की स्थिति ${fertilizerStatus === 'green' ? 'हरी और संतुलित' : fertilizerStatus === 'yellow' ? 'पीली यानी निगरानी योग्य' : 'लाल यानी गंभीर'} है। ${fertilizerAction} पानी की स्थिति ${waterStatus === 'green' ? 'संतुलित' : waterStatus === 'red' ? 'नाजुक' : 'सामान्य'} है। ${weatherWarning ? weatherWarning.alertText : costHint}`;
  } else if (lang === 'ur') {
    voiceScript = `السلام علیکم! آپ کی ${cropType} کی فصل میں کھاد کی حالت ${fertilizerStatus === 'green' ? 'سبز اور درست' : 'توجہ طلب'} ہے۔ ${fertilizerAction} ${costHint}`;
  } else if (lang === 'sw') {
    voiceScript = `Hujambo mkulima! Hali ya mbolea kwa zao lako la ${cropType} ni ${fertilizerStatus}. ${fertilizerAction} Hali ya maji ni ${waterStatus}. ${costHint}`;
  } else if (lang === 'es') {
    voiceScript = `Hola agricultor. El estado del fertilizante en su parcela de ${cropType} está en ${fertilizerStatus}. ${fertilizerAction} En agua está ${waterStatus}. ${costHint}`;
  } else {
    voiceScript = `FieldSnap Advisor check complete for your ${cropType} plot. Fertilizer status is ${fertilizerStatus.toUpperCase()}: ${fertilizerAction} Water status is ${waterStatus.toUpperCase()}: ${waterAction} ${weatherWarning ? weatherWarning.alertText : costHint}`;
  }

  return {
    fertilizerStatus,
    fertilizerTitle,
    fertilizerAction,
    waterStatus,
    waterTitle,
    waterAction,
    costHint,
    yieldHint,
    bachat: {
      ureaBagsSaved,
      dapBagsSaved,
      pumpingHoursSaved,
      estimatedCashSaved,
      currencySymbol: lang === 'hi' ? '₹' : lang === 'ur' ? '₨' : lang === 'sw' ? 'TSh' : lang === 'es' ? '€' : '₹'
    },
    weatherWarning,
    voiceScript
  };
}
