import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useStore } from '../store/useStore.js'
import { useUI } from '../store/useUI.js'
import { Button } from '../components/ui.jsx'
import { askAddDeviceData } from '../sheets.jsx'
import Icon from '../components/Icon.jsx'

export function ConnectSheet({ close }) {
  const { connectToServer } = useStore(); const [url,setUrl]=useState(''); const [code,setCode]=useState(''); const [busy,setBusy]=useState(false)
  const go=async()=>{if(!url.trim()||!code.trim())return useUI.getState().toast('Enter your server address and the code');setBusy(true);try{await connectToServer(url.trim(),code.trim(),askAddDeviceData);close()}catch(e){useUI.getState().toast(e.message||'Could not connect')}finally{setBusy(false)}}
  return <><h3>Connect to my server</h3><p className="muted">Open Settings → Pair the mobile app on the Barbell site you use, then enter its address and code.</p><input className="input" placeholder="Server address" value={url} onChange={e=>setUrl(e.target.value)}/><div style={{height:10}}/><input className="input" placeholder="Pairing code" value={code} onChange={e=>setCode(e.target.value.toUpperCase())}/><div style={{height:12}}/><Button variant="primary" onClick={go} disabled={busy}>{busy?'Connecting…':'Connect'}</Button></>
}

const TERMS=`BARBELL Terms of Service\n\nEffective date: 27 September 2026\nDraft version: 1.0\n\n1. Introduction\nThese Terms of Service govern your use of BARBELL, a fitness and workout-tracking application provided by Focus Technologies. BARBELL helps users plan workouts, follow training programs, log exercise activity, track progress and bodyweight, manage training preferences and, where configured, use optional AI-assisted training features.\n\n2. Scope and Definitions\n“BARBELL,” “App,” “Service,” or “Services” means the BARBELL mobile application, compatible web functionality, and related features provided by Focus Technologies. “We,” “us,” or “our” means Focus Technologies. “You” means the person using BARBELL. A self-hosted server is a BARBELL-compatible server selected and operated by you or another server operator.\n\n3. Acceptance of These Terms\nTapping Get Started indicates that you agree to these Terms and acknowledge the Privacy Policy, subject to applicable law. Opening, scrolling through, or pressing I Understand on an informational legal page is not a separate acceptance action.\n\n4. Fitness and Training Purpose\nBARBELL is a fitness and training tool. No workout, suggested weight, exercise, schedule or progression strategy is guaranteed to be appropriate for every person.\n\n5. Medical and Emergency Disclaimer\nBARBELL is not a medical application or medical service. It does not diagnose, treat, cure or prevent medical conditions and does not replace a qualified professional. BARBELL is not an emergency service.\n\n6. Your Training Responsibilities\nYou remain responsible for deciding whether an exercise, load, intensity, duration, movement or plan is appropriate for you. Stop or modify activity if you experience concerning symptoms, unusual pain or signs of injury.\n\n7. Profiles, Accounts and Modes of Use\nMobile local mode may operate without a traditional cloud account. Self-hosted installations may use profiles, passkeys, sessions and mobile-device pairing.\n\n8. Personalized Workout Plans and AI Coach\nPersonalization is an aid, not a promise that a program is optimal. AI Coach is optional where configured. AI output can be incomplete, incorrect or inappropriate and must be reviewed before following it. AI Coach is not a medical professional.\n\n9. Your Data and Content\nYou retain rights in information you enter. You authorize processing reasonably necessary to provide functions you choose, including storage, synchronization, workout tracking, personalization, calculations, imports, exports and optional AI features.\n\n10. Gym Check-In, Availability and Third Parties\nUse gym check-in only for credentials you are authorized to use. BARBELL is under active development. Features can differ between local, self-hosted and AI configurations. Third-party services and providers are independent.\n\n11. Disclaimers, Changes and Contact\nTo the maximum extent permitted by law, BARBELL is provided “as is” and “as available.” Nothing excludes rights that cannot lawfully be excluded. Focus Technologies may update these Terms when functionality, business practices or applicable requirements change. Questions may be sent to hi@focuslife.space. Do not send passwords, passkeys, API keys, pairing tokens or unnecessary sensitive health information.`
const PRIVACY=`BARBELL Privacy Policy\n\nEffective date: 27 September 2026\nDraft version: 1.0\n\n1. Introduction\nThis Privacy Policy explains how Focus Technologies handles information in connection with BARBELL. BARBELL can operate using local device storage and optional synchronization with a server chosen by the user.\n\n2. Information and Processing\nInformation you may provide includes profile information, onboarding responses, training preferences, routines, exercise logs, bodyweight, notes, goals, settings and imported data. In local mode information may remain primarily on your device. In paired/server mode relevant information may synchronize to the server you choose.\n\n3. Onboarding and Sensitive Information\nOnboarding may request name, goals, gender, date of birth, height, weight, health-condition selections, lifestyle selection, experience, environment, frequency, duration and training time. Health-condition and lifestyle information can be sensitive and does not mean BARBELL has medically evaluated or cleared you to exercise.\n\n4. AI Coach\nAI Coach is optional. When you deliberately use it, BARBELL may provide appropriate training context to the configured AI system. The current architecture uses an allowlist rather than transmitting every stored field. Display name, gender, date of birth, health-condition selections and smoking/alcohol information are not automatically added to an AI-provider payload.\n\n5. Permissions, Notifications and Exports\nCamera permission is requested when scanning is used. Notification permission is separate from entering a preferred training time. If you export data, the destination you select controls its own copy.\n\n6. Retention, Security and Self-hosting\nLocal data remains until modified, deleted or removed through the application/device lifecycle. Server data is subject to the selected server’s configuration, operator and backups. No technology can guarantee absolute security. Self-hosted operators control hosting, backups, administrators, TLS and retention.\n\n7. Analytics and Contact\nThe current product source does not identify a general BARBELL-operated analytics, advertising or telemetry system. Focus Technologies does not state that it sells personal data. Questions may be sent to hi@focuslife.space. Do not send passwords, API keys, passkeys, pairing tokens or unnecessary sensitive information by email.`
function Legal({title,text,close}){return <div className="legal-reader"><h1>{title}</h1><pre>{text}</pre><Button variant="primary" onClick={close}>I Understand</Button></div>}
export function TermsReader({ close }) { return <Legal title="BARBELL Terms of Service" text={TERMS} close={close} /> }
export function PrivacyReader({ close }) { return <Legal title="BARBELL Privacy Policy" text={PRIVACY} close={close} /> }

export const ONBOARDING_VERSION = 3
export const GOALS = ['Strength & Conditioning', 'Bodybuilding', 'Fat Loss', 'Muscle Gain', 'Stamina & Mobility', 'General Fitness']
export const INPUT_STEPS = Object.freeze({
  NAME: { position: 1, total: 2 },
  GOAL: { position: 2, total: 2 },
})
export function normalizedOnboardingStep(onboarding) {
  if (onboarding?.complete) return 5
  if (onboarding?.version === ONBOARDING_VERSION) return Math.max(1, Math.min(5, onboarding.step || 1))
  if (onboarding?.legal) return onboarding.step >= 5 ? 4 : 3
  return 1
}

function Progress({ step, onBack }) {
  const fraction = step.position / step.total
  return <div className="onboarding-progress">
    <button className="onboarding-back" onClick={onBack} aria-label="Back"><Icon name="chevronLeft" /></button>
    <div className="onboarding-progress-track" role="progressbar" aria-label={`Onboarding step ${step.position} of ${step.total}`} aria-valuemin="1" aria-valuemax={step.total} aria-valuenow={step.position}>
      <span style={{ '--progress': `${fraction * 100}%` }} />
    </div>
    <b>{step.position} / {step.total}</b>
  </div>
}

function prefersReducedMotion() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || false
}

function Splash({ onDone }) {
  const identity = useRef(null)
  const completed = useRef(false)
  const done = useRef(onDone)
  const [reduceMotion] = useState(prefersReducedMotion)
  done.current = onDone
  const complete = useCallback(event => {
    if (event && event.target !== event.currentTarget) return
    if (completed.current) return
    completed.current = true
    done.current()
  }, [])
  useEffect(() => {
    if (!reduceMotion || !identity.current) return undefined
    const animation = identity.current.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 240, easing: 'ease-out', fill: 'both' })
    animation.finished.then(() => complete()).catch(() => {})
    return () => animation.cancel()
  }, [complete, reduceMotion])
  return <section className="onboarding-screen onboarding-splash" aria-label="BARBELL">
    <div ref={identity} className={`splash-identity${reduceMotion ? ' reduce-motion' : ''}`} onAnimationEnd={reduceMotion ? undefined : complete}>
      <span className="splash-glow" aria-hidden="true" />
      <img src="/brand/barbell-icon-only.svg" alt="BARBELL" />
    </div>
  </section>
}

function NameScreen({ value, onChange, onBack, onNormalize, onDone }) {
  const screen = useRef(null)
  const input = useRef(null)
  const autofocusTimer = useRef(null)
  const handoffTimer = useRef(null)
  const submitting = useRef(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const normalized = value.trim()

  useEffect(() => {
    autofocusTimer.current = window.setTimeout(() => input.current?.focus(), 300)
    return () => window.clearTimeout(autofocusTimer.current)
  }, [])
  useEffect(() => () => window.clearTimeout(handoffTimer.current), [])
  useEffect(() => {
    const viewport = window.visualViewport
    const element = screen.current
    if (!viewport || !element) return undefined
    let fullHeight = Math.max(window.innerHeight, viewport.height)
    const sync = () => {
      if (viewport.height > fullHeight - 40) fullHeight = viewport.height
      element.style.setProperty('--name-viewport-height', `${Math.round(viewport.height)}px`)
      element.dataset.keyboard = viewport.height < fullHeight - 100 ? 'open' : 'closed'
    }
    sync()
    viewport.addEventListener('resize', sync)
    return () => {
      viewport.removeEventListener('resize', sync)
      element.style.removeProperty('--name-viewport-height')
      delete element.dataset.keyboard
    }
  }, [])

  const submit = useCallback(event => {
    event.preventDefault()
    const name = value.trim()
    if (!name || submitting.current) return
    submitting.current = true
    setIsSubmitting(true)
    onNormalize(name)
    input.current?.blur()
    handoffTimer.current = window.setTimeout(onDone, 200)
  }, [onDone, onNormalize, value])

  const back = () => {
    input.current?.blur()
    onBack()
  }

  return <form ref={screen} className="onboarding-screen onboarding-name" onSubmit={submit}>
    <main className="name-main">
      <Progress step={INPUT_STEPS.NAME} onBack={back} />
      <div className="name-content-scroll">
        <div className="onboarding-copy">
          <h1>What’s your name?</h1>
          <p>Let’s make your training personal.</p>
          <div className="name-input-block">
            <label className="name-input-label" htmlFor="onboarding-name">Your name</label>
            <input ref={input} id="onboarding-name" className="input" name="name" type="text" autoComplete="name" autoCapitalize="words" enterKeyHint="next" placeholder="Your name" value={value} onChange={event => onChange(event.target.value)} />
          </div>
        </div>
      </div>
    </main>
    <div className="name-actions"><Button type="submit" variant="primary" disabled={!normalized || isSubmitting}>Continue</Button></div>
  </form>
}

function Preparing({ onDone }) {
  const [stage, setStage] = useState(0)
  const lines = ['Analyzing your goal...', 'Building your workout plan...', 'Personalizing your training...', "You’re ready."]
  useEffect(() => {
    if (stage >= lines.length) { const done = setTimeout(onDone, 260); return () => clearTimeout(done) }
    const timer = setTimeout(() => setStage(s => s + 1), 480)
    return () => clearTimeout(timer)
  }, [stage, lines.length, onDone])
  return <section className="onboarding-screen onboarding-preparing">
    <img className="preparing-logo" src="/brand/barbell-icon-only.svg" alt="BARBELL" />
    <div className="preparing-steps" aria-live="polite">{lines.map((line, i) => <div key={line} className={i < stage ? 'complete' : i === stage ? 'active' : ''}><span>{i < stage ? '✓' : ''}</span><b>{line}</b></div>)}</div>
    <div className="preparing-track"><span style={{ width: `${Math.min(stage, 4) * 25}%` }} /></div>
  </section>
}

export default function MobileOnboarding() {
  const { S, update, chooseLocalMode } = useStore()
  const p = S.personalization || {}
  const initial = useMemo(() => normalizedOnboardingStep(S.onboarding), [])
  const [step, setStep] = useState(initial)
  const startPending = useRef(false)
  const selectedGoal = p.goals?.find(goal => GOALS.includes(goal)) || ''
  const persistStep = next => {
    update(s => { s.onboarding = { ...s.onboarding, version: ONBOARDING_VERSION, step: next, draft: null, weightAdded: false } })
    setStep(next)
  }
  const openLegal = Reader => useUI.getState().openSheet(close => <Reader close={close} />)
  const start = async () => {
    if (startPending.current) return
    startPending.current = true
    update(s => { s.onboarding = { ...s.onboarding, version: ONBOARDING_VERSION, step: 3, draft: null, legal: { termsVersion: '1.0', privacyVersion: '1.0', acceptedAt: Date.now() } } })
    try {
      await chooseLocalMode()
      setStep(3)
    } finally {
      startPending.current = false
    }
  }
  const finish = () => {
    update(s => { s.onboarding = { ...s.onboarding, version: ONBOARDING_VERSION, step: 5, complete: true, draft: null, weightAdded: false } })
    useStore.setState({ needsMobileOnboarding: false })
  }

  if (step === 1) return <Splash onDone={() => persistStep(2)} />
  if (step === 2) return <section className="onboarding-screen onboarding-welcome">
    <div className="welcome-center"><div className="welcome-content"><div className="welcome-identity"><span aria-hidden="true" /><img src="/brand/barbell-icon-only.svg" alt="BARBELL" /></div><h1>Welcome to Barbell</h1><p>Your workout. Your progress.</p></div></div>
    <div className="onboarding-actions"><Button variant="primary" onClick={start}>Get Started</Button><small>By tapping Get Started, you agree to our <button onClick={() => openLegal(TermsReader)}>Terms of Service</button> and acknowledge our <button onClick={() => openLegal(PrivacyReader)}>Privacy Policy</button>.</small></div>
  </section>
  if (step === 3) return <NameScreen value={p.displayName || ''} onChange={displayName => update(s => { s.personalization = { ...s.personalization, displayName } })} onBack={() => persistStep(2)} onNormalize={displayName => update(s => { s.personalization = { ...s.personalization, displayName } })} onDone={() => persistStep(4)} />
  if (step === 4) return <section className="onboarding-screen onboarding-goals">
    <Progress step={INPUT_STEPS.GOAL} onBack={() => persistStep(3)} /><div className="goal-copy"><h1>What’s your goal?</h1></div>
    <div className="goal-grid" role="radiogroup" aria-label="Training goal">{GOALS.map((goal, i) => <button key={goal} type="button" role="radio" aria-checked={selectedGoal === goal} className={selectedGoal === goal ? 'selected' : ''} onClick={() => update(s => { s.personalization = { ...s.personalization, goals: [goal] } })}><span className={`goal-art goal-art-${i + 1}`} aria-hidden="true"><Icon name={['barbell','arm','figureRun','figureStrength','stretch','figureRun'][i]} /></span><b>{goal}</b>{selectedGoal === goal && <i aria-hidden="true">✓</i>}</button>)}</div>
    <Button variant="primary" disabled={!selectedGoal} onClick={() => persistStep(5)}>Continue</Button>
  </section>
  return <Preparing onDone={finish} />
}
