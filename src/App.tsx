import { AppContext } from './AppContext';
import ReactGA from 'react-ga4';
import { Switch, Route, useLocation } from "react-router-dom";
import React, { useContext, useEffect } from 'react';
import Login from "./pages/Login/Login";
import './scss/app.scss'
import Account from './pages/Account/Account';
import BuildTracker from './pages/BuildTracker/BuildTracker';
import BuildTrackerPanel from './pages/BuildTracker/BuildTrackerPanel';
import { getUser } from './helpers';
import BuildTrackerHeader from './components/BuildTrackerHeader/BuildTrackerHeader';

function App() {
  const location = useLocation()
  const { isLoggedIn, theme } = useContext(AppContext)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })

    ReactGA.send({
      hitType: 'pageview',
      page: window.location.pathname
    })

    if (window.location.pathname.includes('build-tracker')) {
      const head = document.head || document.querySelector('head')
      const title = document.querySelector('title')
      if (head) head.title = 'Build Tracker'
      if (title) title.textContent = 'Build Tracker'
    }
  }, [location, window.location.pathname])

  return (
    <Switch>
      <Route exact path="/">
        <div className={`page__wrapper${theme ? '--dark' : ''}`}>
          <div className={`page__row${theme ? '--dark' : ''}`} style={{ marginLeft: isLoggedIn ? '' : 0 }}>
            <BuildTracker />
          </div>
        </div>
      </Route>

      <Route exact path="/login">
        <div className={`page__wrapper${theme ? '--dark' : ''}`}>
          <BuildTrackerHeader />
          <Login />
        </div>
      </Route>
      <Route exact path="/account">
        <div className={`page__wrapper${theme ? '--dark' : ''}`}>
          <BuildTrackerHeader />
          <div className={`page__row${theme ? '--dark' : ''}`} style={{ marginLeft: isLoggedIn ? '' : 0 }}>
            <Account />
          </div>
        </div>
      </Route>

      {getUser().buildTrackerAccess ?
        <Route exact path="/control-panel">
          <BuildTrackerPanel />
        </Route>
        : ''}

      {/* FALLBACK PAGE -> RENDER HOME*/}
      <Route>
        <div className={`page__wrapper${theme ? '--dark' : ''}`}>
          <BuildTrackerHeader />
          <div className={`page__row${theme ? '--dark' : ''}`} style={{ marginLeft: isLoggedIn ? '' : 0 }}>
            <BuildTracker />
          </div>
        </div>
      </Route>
    </Switch>
  )
}

export default React.memo(App)
