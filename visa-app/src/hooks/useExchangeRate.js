import { useState, useEffect } from 'react'

export function useExchangeRate() {
  const [exchangeRate, setExchangeRate] = useState(null)
  const [previousRates, setPreviousRates] = useState(null)
  const [rateChanges, setRateChanges] = useState({})

  useEffect(() => {
    fetch('https://api.exchangerate-api.com/v4/latest/KRW')
      .then(r => r.json())
      .then(data => {
        const r = data.rates || {}
        const toKRW = code => r[code] ? Math.round((1 / r[code]) * 100) / 100 : null
        
        const currentRates = {
          CNY: toKRW('CNY'), 
          HKD: toKRW('HKD'), 
          TWD: toKRW('TWD'), 
          MOP: toKRW('MOP'),
          USD: toKRW('USD'), 
          JPY: toKRW('JPY'), 
          VND: toKRW('VND'), 
          PHP: toKRW('PHP'), 
          THB: toKRW('THB'),
          _date: data.date || null,
        }

        // Calculate change percentages if we have previous rates
        if (previousRates) {
          const changes = {}
          Object.keys(currentRates).forEach(code => {
            if (code !== '_date' && currentRates[code] && previousRates[code]) {
              const changePercent = ((currentRates[code] - previousRates[code]) / previousRates[code] * 100)
              changes[code] = Math.round(changePercent * 100) / 100 // Round to 2 decimals
            }
          })
          setRateChanges(changes)
        }

        // Store current rates as previous for next comparison
        if (exchangeRate) {
          setPreviousRates(exchangeRate)
        }
        
        setExchangeRate(currentRates)
      })
      .catch(() => {})
  }, [])

  return { exchangeRate, rateChanges }
}