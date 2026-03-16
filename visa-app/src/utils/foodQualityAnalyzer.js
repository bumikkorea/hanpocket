import { koreanFoodDB } from '../data/koreanFoodDB.js'

/**
 * Korean Food DB Quality Analyzer
 * Board Meeting 062 - 한식 DB 품질 표준 수립
 */

export const QUALITY_STANDARDS = {
  verified: {
    name: 'Verified Quality',
    requirements: [
      'Complete recipe with steps',
      'Detailed ingredients with measurements', 
      'Cultural background (origin_zh, origin_en)',
      'Cooking tips in all languages',
      'Accurate spicy level (0-5)',
      'Complete allergen information',
      'Price range information'
    ],
    description: 'Premium recipes with complete information and cultural context'
  },
  quality: {
    name: 'Quality Standard', 
    requirements: [
      'Basic recipe information',
      'Ingredient list',
      'Description in all languages',
      'Category and basic tags',
      'Spicy level indicated',
      'Some allergen information'
    ],
    description: 'Good quality recipes with essential information'
  },
  basic: {
    name: 'Basic Entry',
    requirements: [
      'Name in all languages',
      'Category assigned',
      'Basic description',
      'Image (if available)'
    ],
    description: 'Minimal information entries'
  }
}

export function analyzeFoodQuality() {
  const analysis = {
    total: koreanFoodDB.length,
    byQuality: { verified: 0, quality: 0, basic: 0, unknown: 0 },
    byCategory: {},
    qualityIssues: [],
    recommendations: []
  }

  // Initialize category counters
  const categories = ['banchan', 'street', 'dessert', 'cafe', 'guk', 'jeon', 
                    'gui', 'bap', 'myeon', 'jjigae', 'alcohol', 'chinese', 
                    'western', 'bunsik', 'japanese']
  categories.forEach(cat => {
    analysis.byCategory[cat] = { total: 0, verified: 0, quality: 0, basic: 0 }
  })

  // Analyze each food item
  koreanFoodDB.forEach(item => {
    const quality = analyzeItemQuality(item)
    analysis.byQuality[quality]++
    
    if (analysis.byCategory[item.category]) {
      analysis.byCategory[item.category].total++
      analysis.byCategory[item.category][quality]++
    }

    // Record quality issues
    const issues = findQualityIssues(item)
    if (issues.length > 0) {
      analysis.qualityIssues.push({
        id: item.id,
        name: item.ko,
        category: item.category,
        currentQuality: quality,
        issues: issues
      })
    }
  })

  // Generate recommendations
  analysis.recommendations = generateRecommendations(analysis)

  return analysis
}

function analyzeItemQuality(item) {
  if (item.quality === 'verified' && hasVerifiedFeatures(item)) {
    return 'verified'
  } else if (item.quality === 'quality' || hasQualityFeatures(item)) {
    return 'quality'
  } else {
    return 'basic'
  }
}

function hasVerifiedFeatures(item) {
  return !!(
    item.recipe && 
    item.recipe.ingredients && 
    item.recipe.steps_zh && 
    item.recipe.steps_en &&
    item.origin_zh && 
    item.origin_en &&
    item.desc_zh && 
    item.desc_en &&
    typeof item.spicy === 'number' &&
    item.allergens &&
    item.price
  )
}

function hasQualityFeatures(item) {
  return !!(
    item.desc_zh && 
    item.desc_en &&
    item.category &&
    typeof item.spicy === 'number'
  )
}

function findQualityIssues(item) {
  const issues = []
  
  // Missing translations
  if (!item.zh) issues.push('missing_chinese_name')
  if (!item.en) issues.push('missing_english_name')
  if (!item.desc_zh) issues.push('missing_chinese_description')
  if (!item.desc_en) issues.push('missing_english_description')
  
  // Missing recipe details for verified items
  if (item.quality === 'verified') {
    if (!item.recipe) issues.push('verified_missing_recipe')
    if (!item.origin_zh) issues.push('verified_missing_chinese_origin')
    if (!item.origin_en) issues.push('verified_missing_english_origin')
    if (!item.recipe?.tips_zh) issues.push('verified_missing_chinese_tips')
    if (!item.recipe?.tips_en) issues.push('verified_missing_english_tips')
  }
  
  // Data consistency issues
  if (typeof item.spicy !== 'number' || item.spicy < 0 || item.spicy > 5) {
    issues.push('invalid_spicy_level')
  }
  
  if (!item.allergens || !Array.isArray(item.allergens)) {
    issues.push('missing_allergen_info')
  }
  
  if (!item.price || !item.price.includes('-')) {
    issues.push('missing_or_invalid_price')
  }
  
  // Category validation
  const validCategories = ['banchan', 'street', 'dessert', 'cafe', 'guk', 
                          'jeon', 'gui', 'bap', 'myeon', 'jjigae', 'alcohol', 
                          'chinese', 'western', 'bunsik', 'japanese']
  if (!validCategories.includes(item.category)) {
    issues.push('invalid_category')
  }

  return issues
}

function generateRecommendations(analysis) {
  const recommendations = []
  const { byCategory, byQuality, qualityIssues } = analysis

  // Category balance recommendations
  Object.entries(byCategory).forEach(([category, stats]) => {
    if (stats.total === 0) {
      recommendations.push({
        type: 'category_missing',
        priority: 'high',
        message: `${category} 카테고리에 아이템이 없습니다.`,
        action: `Add at least 5 ${category} items`
      })
    } else if (stats.total < 5) {
      recommendations.push({
        type: 'category_insufficient', 
        priority: 'medium',
        message: `${category} 카테고리 아이템 부족 (${stats.total}개)`,
        action: `Expand ${category} to at least 10 items`
      })
    }

    if (stats.verified === 0 && stats.total > 0) {
      recommendations.push({
        type: 'quality_improvement',
        priority: 'medium', 
        message: `${category} 카테고리에 verified 품질 아이템이 없습니다.`,
        action: `Upgrade 2-3 popular ${category} items to verified quality`
      })
    }
  })

  // Quality distribution recommendations
  const verifiedRatio = byQuality.verified / analysis.total
  if (verifiedRatio < 0.25) {
    recommendations.push({
      type: 'overall_quality',
      priority: 'high',
      message: `Verified 품질 비율 너무 낮음 (${Math.round(verifiedRatio * 100)}%)`,
      action: 'Target 25% verified quality ratio'
    })
  }

  // Specific quality issues
  const commonIssues = {}
  qualityIssues.forEach(item => {
    item.issues.forEach(issue => {
      commonIssues[issue] = (commonIssues[issue] || 0) + 1
    })
  })

  Object.entries(commonIssues)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .forEach(([issue, count]) => {
      recommendations.push({
        type: 'data_consistency',
        priority: count > 10 ? 'high' : 'medium',
        message: `${count}개 아이템에서 ${issue} 문제 발견`,
        action: `Fix ${issue} in ${count} items`
      })
    })

  return recommendations.sort((a, b) => {
    const priority = { high: 3, medium: 2, low: 1 }
    return priority[b.priority] - priority[a.priority]
  })
}

export function generateQualityReport() {
  const analysis = analyzeFoodQuality()
  
  const report = `
# Korean Food DB Quality Analysis Report
**Generated**: ${new Date().toLocaleString('ko-KR')}

## 📊 Overall Statistics
- **Total Items**: ${analysis.total}
- **Verified Quality**: ${analysis.byQuality.verified} (${Math.round(analysis.byQuality.verified/analysis.total*100)}%)
- **Quality Standard**: ${analysis.byQuality.quality} (${Math.round(analysis.byQuality.quality/analysis.total*100)}%)
- **Basic Entries**: ${analysis.byQuality.basic} (${Math.round(analysis.byQuality.basic/analysis.total*100)}%)

## 📈 Category Distribution
${Object.entries(analysis.byCategory)
  .sort(([,a], [,b]) => b.total - a.total)
  .map(([cat, stats]) => `- **${cat}**: ${stats.total}개 (V:${stats.verified}, Q:${stats.quality}, B:${stats.basic})`)
  .join('\n')}

## ⚠️ Top Recommendations (${analysis.recommendations.length} total)
${analysis.recommendations.slice(0, 10)
  .map((rec, i) => `${i+1}. **[${rec.priority.toUpperCase()}]** ${rec.message}\n   → ${rec.action}`)
  .join('\n\n')}

## 🔧 Quality Issues Found
${analysis.qualityIssues.length} items have quality issues
${analysis.qualityIssues.slice(0, 5)
  .map(item => `- **${item.name}** (${item.category}): ${item.issues.join(', ')}`)
  .join('\n')}

---
*Board Meeting 062 - Quality Standards Initiative*
`

  return { report, analysis }
}

// Functions exported above with export keyword