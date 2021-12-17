import './Statistic.css';
import Category from '../../components/Category/Category';
import React, { useState, useEffect } from 'react';
import expensesService from '../../services/expensesService';
import categoriesService from '../../services/categoriesService';
import CategoriesPieChart from '../../components/CategoriesPieChart/CategoriesPieChart'

function Statistic() {
  const [expenses, setExpenses] = useState([])
  const [categories, setCategories] = useState([])
  const [sortedExpenses, setSortedExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [dateArray, setDateArray] = useState([])
  const [chosenMonth, setChosenMonth] = useState(0)
  const [monthExpenses, setMonthExpenses] = useState(0)

  async function fetchData() {
    let expensesData = await expensesService.getExpenses()
    let categoriesData = await categoriesService.getCategories()
    setExpenses(expensesData)
    setCategories(categoriesData)
    fetchMonths()
  }

  function fetchMonths() {
    let dates = expenses.map((expense) => new Date(expense.date))

    let datepointer = new Date(Math.min.apply(null, dates))
    let maxdate = new Date(Math.max.apply(null, dates))
    datepointer.setDate(1); maxdate.setDate(1)
    datepointer.setHours(0, 0, 0, 0); maxdate.setHours(0, 0, 0, 0)

    let tempDateArray = []
    let id = 0
    while (datepointer <= maxdate) {
      tempDateArray.push({ id: id, month: new Date(datepointer) })
      datepointer.setMonth(datepointer.getMonth() + 1)
      id += 1
    }
    setDateArray(tempDateArray)
  }

  function filterByMonth() {
    let startDate = new Date(dateArray[chosenMonth].month)
    let endDate = new Date(dateArray[chosenMonth].month)
    endDate.setMonth(endDate.getMonth() + 1)

    let filtered_expenses = expenses.filter((expense) => ((new Date(expense.date) >= startDate) && (new Date(expense.date) < endDate)))
    return filtered_expenses
  }

  async function sortExpenses() {
    let filtered_expenses = filterByMonth()
    let sorted = categories.map((category) => ({
      "id": category._id,
      "title": category.title,
      "content": filtered_expenses.filter((expense) => expense.category === category._id),
      "amount": filtered_expenses.filter((expense) => expense.category === category._id).reduce((sum, expense) => sum + expense.amount, 0)
    }))
    setSortedExpenses(sorted)
    setMonthExpenses(sorted.reduce((sum, category) => (sum + category.amount), 0))
  }

  function changeMonth(month) {
    setLoading(true)
    setChosenMonth(month)
  }


  useEffect(() => {
    if (loading) {
      fetchData()
    }
    return () => { setLoading(false) }
  })

  useEffect(() => {
    if ((dateArray.length !== 0)) {
      sortExpenses()
    }
  }, [expenses, categories, dateArray, chosenMonth, loading])

  return (
    <main>
      <h1>Statistic</h1>
      {!loading && dateArray.length !== 0 ? (
        <>
          <select value={chosenMonth} onChange={e => changeMonth(e.target.value)}>
            {dateArray.map((date) => (
              <option key={date.id} value={date.id}>{new Date(date.month).toLocaleString('default', { month: 'long', year: 'numeric' })}</option>
            ))}
          </select>
          <h2>Spent in total: {monthExpenses.toLocaleString()} ₽</h2>
          {!!monthExpenses && <>
            <CategoriesPieChart data={sortedExpenses} />
            <ul>
              {sortedExpenses.map((category) => (
                <Category key={category.id} id={category.id} title={category.title} amount={category.amount} content={category.content} />
              ))}
            </ul>
          </>}
        </>
      ) : (<p>Loading...</p>)}
    </main>
  );
}

export default Statistic;