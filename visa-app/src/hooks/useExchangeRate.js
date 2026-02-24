import { useState, useEffect } from 'react'

export function useExchangeRate() {
  const [exchangeRate, setExchangeRate] = useState(null)

  useEffect(() => {
    fetch('https://api.exchangerate-api.com/v4/latest/KRW')
      .then(r => r.json())
      .then(data => {
        const r = data.rates || {}
        const toKRW = code => r[code] ? Math.round((1 / r[code]) * 100) / 100 : null
        setExchangeRate({
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
        })
      })
      .catch(() => {})
  }, [])

  return exchangeRate
}