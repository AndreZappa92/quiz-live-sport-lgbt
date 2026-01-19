import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  onSnapshot, 
  updateDoc, 
  collection, 
  increment 
} from 'firebase/firestore';
import { 
  getAuth, 
  signInAnonymously, 
  signInWithCustomToken, 
  onAuthStateChanged 
} from 'firebase/auth';
import { Trophy, Users, Play, ChevronRight, CheckCircle2, XCircle, Crown, AlertCircle, Loader2, QrCode, Copy, Check, Globe, Settings, ShieldAlert, Wifi, Clock, Zap, CheckSquare, Coins, Smile } from 'lucide-react';

// --- COMPONENTI GRAFICI ---
const LogoArcigay = ({ className }) => (
  <img 
    src="/logoCIG.png" 
    alt="Logo CIG Arcigay Milano" 
    className={className} 
    onError={(e) => {
      e.target.onerror = null; 
      e.target.src = "https://www.arcigaymilano.org/wp-content/themes/arcigay-milano/assets/images/logo.png";
    }} 
  />
);

// --- CONFIGURAZIONE FIREBASE ---
const getFirebaseConfig = () => {
  try {
    if (typeof window !== 'undefined' && window.__firebase_config) {
      return JSON.parse(window.__firebase_config);
    }
  } catch (e) {
    console.error("Errore nel parsing della configurazione Firebase:", e);
  }
  
  return {
    apiKey: "AIzaSyDOWS0ZMGxhj6ATL6FFycR-DATvuYug3WM",
    authDomain: "quiz-live-sport-lgbt.firebaseapp.com",
    projectId: "quiz-live-sport-lgbt",
    storageBucket: "quiz-live-sport-lgbt.firebasestorage.app",
    messagingSenderId: "741735100972",
    appId: "1:741735100972:web:6040adbb5b040257931789",
    measurementId: "G-47N6SFEWZG"
  };
};

const firebaseConfig = getFirebaseConfig();
const appId = typeof window !== 'undefined' && window.__app_id ? window.__app_id : 'quiz-lgbt-sport-2026';
const TIMER_SECONDS = 30;

let app, auth, db;
try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (e) {
  console.warn("Errore inizializzazione Firebase:", e);
}

const QUIZ_DATA = {
  title: "Sport e Inclusione: LGBT+",
  questions: [
    {
      id: 1,
      question: "In quale città e in quale anno si sono tenuti i primi Gay Games, l'evento multisportivo internazionale dedicato alla comunità LGBT+?",
      options: [
        { text: "Amsterdam, 1998", rationale: "Amsterdam ha ospitato un'edizione molto famosa, ma non è stata la città d'esordio.", isCorrect: false },
        { text: "San Francisco, 1982", rationale: "Fondati da Tom Waddell, l'obiettivo era promuovere lo spirito di inclusione e partecipazione attraverso lo sport.", isCorrect: true },
        { text: "New York, 1969", rationale: "Il 1969 è l'anno dei moti di Stonewall, ma la prima manifestazione sportiva ufficiale arrivò oltre un decennio dopo.", isCorrect: false },
        { text: "Londra, 1975", rationale: "Sebbene Londra sia attiva nell'attivismo, i primi giochi nacquero sulla costa occidentale degli Uniti.", isCorrect: false }
      ]
    },
    {
      id: 2,
      question: "Chi è stato il primo calciatore professionista in attività a fare coming out nel 1990?",
      options: [
        { text: "Thomas Hitzlsperger", rationale: "L'ex centrocampista della Lazio ha fatto coming out solo dopo il ritiro dall'attività agonistica.", isCorrect: false },
        { text: "Justin Fashanu", rationale: "Fu un pioniere assoluto nel calcio inglese, purtroppo affrontando enormi pregiudizi per la sua scelta.", isCorrect: true },
        { text: "Jakub Jankto", rationale: "Jankto è uno dei pochi calciatori moderni ad averlo fatto in attività, ma molti anni dopo il 1990.", isCorrect: false },
        { text: "Robbie Rogers", rationale: "Rogers fece coming out nel 2013, diventando un simbolo per la MLS americana.", isCorrect: false }
      ]
    },
    {
      id: 3,
      question: "L'atleta Laurel Hubbard ha segnato la storia delle Olimpiadi di Tokyo 2020 per quale motivo?",
      options: [
        { text: "È stata la prima donna transgender a competere in una gara individuale", rationale: "La sua partecipazione nel sollevamento pesi ha aperto un importante dibattito globale sull'inclusività e le regole sportive.", isCorrect: true },
        { text: "Ha vinto la prima medaglia d'oro per una persona non binaria", rationale: "Sebbene sia stata una pioniera, non ha raggiunto il podio durante quell'edizione dei Giochi.", isCorrect: false },
        { text: "È stata la portabandiera della squadra dei rifugiati", rationale: "Questo ruolo è stato ricoperto da altri atleti; la Hubbard rappresentava la Nuova Zelanda.", isCorrect: false },
        { text: "Ha stabilito un record mondiale nel lancio del disco", rationale: "La Hubbard gareggiava nella categoria del sollevamento pesi, non nell'atletica leggera.", isCorrect: false }
      ]
    },
    {
      id: 4,
      question: "Quale icona del tennis mondiale ha vinto 18 titoli del Grande Slam ed è stata una delle prime atlete d'élite a vivere apertamente la propria omosessualità?",
      options: [
        { text: "Billie Jean King", rationale: "Anche lei è un'icona dei diritti, ma il suo coming out pubblico è avvenuto in circostanze diverse rispetto alla Navratilova.", isCorrect: false },
        { text: "Chris Evert", rationale: "Storica rivale della Navratilova, la Evert non appartiene alla comunità LGBT+.", isCorrect: false },
        { text: "Martina Navratilova", rationale: "Oltre ai successi in campo, è diventata una delle più influenti attiviste per i diritti LGBT+ nel mondo dello sport.", isCorrect: true },
        { text: "Steffi Graf", rationale: "La tennista tedesca ha dominato gli anni '90 ma non è nota per attivismo legato alla comunità LGBT+.", isCorrect: false }
      ]
    },
    {
      id: 5,
      question: "La calciatrice Megan Rapinoe è famosa non solo per i suoi successi in campo, ma anche per il suo attivismo. Quale premio ha vinto nel 2019?",
      options: [
        { text: "Pallone d'Oro femminile", rationale: "In quell'anno ha trascinato gli USA alla vittoria del Mondiale, diventando un simbolo globale di lotta per l'uguaglianza.", isCorrect: true },
        { text: "Premio Oscar per il miglior documentario", rationale: "Sebbene sia apparsa in molti media, non ha mai vinto un premio dell'Academy cinematografica.", isCorrect: false },
        { text: "Medaglia d'oro nel nuoto sincronizzato", rationale: "La Rapinoe è esclusivamente una calciatrice professionista.", isCorrect: false },
        { text: "Sindaco della città di Seattle", rationale: "È molto amata a Seattle, ma non ha mai ricoperto cariche politiche elettive.", isCorrect: false }
      ]
    },
    {
      id: 6,
      question: "Durante i Mondiali di calcio in Qatar 2022, quale simbolo di supporto alla comunità LGBT+ è stato al centro di una disputa tra FIFA e diverse nazionali europee?",
      options: [
        { text: "La fascia da capitano 'OneLove'", rationale: "La FIFA proibì l'uso della fascia arcobaleno minacciando sanzioni sportive ai capitani che l'avessero indossata.", isCorrect: true },
        { text: "Le scarpe con i tacchetti glitterati", rationale: "Non c'è stata alcuna polemica specifica riguardante le calzature dei giocatori in quel senso.", isCorrect: false },
        { text: "Il fumo colorato arcobaleno negli stadi", rationale: "L'uso di fumogeni è vietato per motivi di sicurezza, indipendentemente dal colore.", isCorrect: false },
        { text: "Il cambio del nome della competizione in 'Gay Cup'", rationale: "Il nome della competizione è rimasto FIFA World Cup senza alcuna proposta di modifica.", isCorrect: false }
      ]
    },
    {
      id: 7,
      question: "Chi è il tuffatore britannico, oro olimpico a Tokyo 2020, che usa la sua visibilità per normalizzare il coming out e combattere l'omofobia?",
      options: [
        { text: "Tom Daley", rationale: "Oltre ai tuffi, è amatissimo per la sua passione per l'uncinetto e per il suo impegno costante nel sociale.", isCorrect: true },
        { text: "Matthew Mitcham", rationale: "Mitcham è stato un grande campione australiano, ma il riferimento al bronzo olimpico e alla passione per l'uncinetto è tipico di Daley.", isCorrect: false },
        { text: "Greg Louganis", rationale: "Louganis è una leggenda del passato (anni '80), mentre l'atleta in questione è contemporaneo.", isCorrect: false },
        { text: "Ian Thorpe", rationale: "Thorpe è un nuotatore (non un tuffatore) e ha fatto coming out dopo la fine della carriera.", isCorrect: false }
      ]
    },
    {
      id: 8,
      question: "Quale di questi è lo scopo principale degli 'EuroGames'?",
      options: [
        { text: "Selezionare gli atleti per le prossime Olimpiadi", rationale: "Gli EuroGames non sono un evento di qualificazione olimpica ufficiale.", isCorrect: false },
        { text: "Gareggiare esclusivamente per vincere premi in denaro", rationale: "Lo spirito dell'evento è sociale e comunitario, non basato su grandi premi monetari.", isCorrect: false },
        { text: "Contrastare la discriminazione e sostenere l'integrazione LGBT+ nello sport", rationale: "Si tratta di un evento multisportivo europeo aperto a tutti, indipendentemente dall'orientamento sessuale.", isCorrect: true },
        { text: "Permettere la partecipazione solo ad atleti professionisti", rationale: "L'evento è aperto ad atleti di ogni livello, dai dilettanti ai professionisti.", isCorrect: false }
      ]
    },
    {
      id: 9,
      question: "Nel 2018, lo sciatore Gus Kenworthy ha attirato l'attenzione mondiale per un gesto alle Olimpiadi Invernali di Pyeongchang. Di cosa si trattava?",
      options: [
        { text: "Un bacio in diretta TV al suo compagno", rationale: "È stato un momento storico di visibilità e spontaneità in un contesto sportivo globale molto seguito.", isCorrect: true },
        { text: "Ha gareggiato indossando un tutù arcobaleno", rationale: "Gus ha gareggiato con la divisa ufficiale della sua nazionale.", isCorrect: false },
        { text: "Ha rifiutato di ritirare la medaglia d'argento", rationale: "Non c'è stato alcun rifiuto della medaglia per motivi legati all'orientamento sessuale.", isCorrect: false },
        { text: "Ha portato un gatto randagio sul podio", rationale: "Gus è noto per aver salvato dei cani in Russia, ma il gesto simbolico del 2018 riguardava la sua vita affettiva.", isCorrect: false }
      ]
    },
    {
      id: 10,
      question: "Cosa rappresentano i 'Rainbow Laces' (lacci arcobaleno) spesso indossati dagli atleti in varie discipline?",
      options: [
        { text: "Una campagna per l'inclusione della comunità LGBT+ nello sport", rationale: "Nata nel Regno Unito, l'iniziativa invita gli atleti a mostrare solidarietà attraverso questo piccolo ma visibile dettaglio.", isCorrect: true },
        { text: "Un nuovo standard obbligatorio per le scarpe da corsa", rationale: "Non esiste alcun obbligo tecnico che imponga i colori arcobaleno per i lacci.", isCorrect: false },
        { text: "Il simbolo di chi ha vinto più di dieci medaglie", rationale: "Le medaglie e i lacci sono simboli completamente distinti.", isCorrect: false },
        { text: "Una decorazione usata solo durante il mese di dicembre", rationale: "Sebbene siano più comuni durante i Pride Month, vengono usati tutto l'anno per diverse campagne di sensibilizzazione.", isCorrect: false }
      ]
    }
  ]
};

const COLORS = [
  'bg-[#e30613] hover:bg-[#c40510]', 
  'bg-[#0054a6] hover:bg-[#00448a]', 
  'bg-[#009640] hover:bg-[#008036]', 
  'bg-[#ffde00] hover:bg-[#e6c800]'  
];

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  // Inizializzazione sincronizzata con sessionStorage
  const [role, setRole] = useState(() => sessionStorage.getItem('activeRole'));
  const [roomCode, setRoomCode] = useState(() => sessionStorage.getItem('activeRoom') || '');
  const [playerName, setName] = useState(() => sessionStorage.getItem('activePlayerName') || '');
  
  const [gameState, setGameState] = useState(null);
  const [players, setPlayers] = useState([]);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState(null);
  const [lastPointsEarned, setLastPointsEarned] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [loadingAction, setLoadingAction] = useState(false);
  const [localIp, setLocalIp] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!document.getElementById('tailwind-cdn')) {
      const script = document.createElement('script');
      script.id = 'tailwind-cdn';
      script.src = 'https://cdn.tailwindcss.com';
      document.head.appendChild(script);
    }
  }, []);

  const isFirebaseSetup = firebaseConfig && firebaseConfig.apiKey !== "";

  // Protezione contro refresh/uscita e tasto "Indietro"
  useEffect(() => {
    if (!role) return;

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };

    window.history.pushState(null, "", window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, "", window.location.href);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [role]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const codeFromUrl = params.get('room');
    if (codeFromUrl && !roomCode) setRoomCode(codeFromUrl.toUpperCase());
  }, [roomCode]);

  // Autenticazione e recupero persistente migliorato
  useEffect(() => {
    if (!isFirebaseSetup) {
      setAuthLoading(false);
      return;
    }
    const initAuth = async () => {
      try {
        if (typeof window !== 'undefined' && window.__initial_auth_token) {
          await signInWithCustomToken(auth, window.__initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        setErrorMessage("Errore connessione Firebase.");
      } finally {
        setAuthLoading(false);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      // Riconnessione automatica silenziosa se mancano dati locali ma l'utente è già loggato
      if (u && roomCode && !playerName) {
        const playerRef = doc(db, 'artifacts', appId, 'public', 'data', 'players', `${roomCode}_${u.uid}`);
        const pSnap = await getDoc(playerRef);
        if (pSnap.exists()) {
          const pData = pSnap.data();
          setRole('player');
          setName(pData.name);
          sessionStorage.setItem('activeRole', 'player');
          sessionStorage.setItem('activePlayerName', pData.name);
          sessionStorage.setItem('activeRoom', roomCode);
        }
      }
    });
    return () => unsubscribe();
  }, [isFirebaseSetup, roomCode, playerName]);

  useEffect(() => {
    if (!user || !roomCode || !role || !db) return;
    const normalizedCode = roomCode.trim().toUpperCase();
    const roomRef = doc(db, 'artifacts', appId, 'public', 'data', 'rooms', normalizedCode);
    const unsubRoom = onSnapshot(roomRef, (docSnap) => {
      if (docSnap.exists()) {
        setGameState(docSnap.data());
        setErrorMessage('');
      } else if (role === 'player') {
        setErrorMessage('Stanza chiusa o inesistente.');
      }
    }, (err) => console.error("Room listener error:", err));

    const playersRef = collection(db, 'artifacts', appId, 'public', 'data', 'players');
    const unsubPlayers = onSnapshot(playersRef, (snapshot) => {
      const allPlayers = snapshot.docs
        .map(d => d.data())
        .filter(p => p.roomCode === normalizedCode)
        .sort((a, b) => b.score - a.score);
      setPlayers(allPlayers);
    }, (err) => console.error("Players listener error:", err));

    return () => { unsubRoom(); unsubPlayers(); };
  }, [user, roomCode, role]);

  useEffect(() => {
    if (gameState?.status === 'playing' && !gameState.showResults && gameState.questionStartTime) {
      const interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - gameState.questionStartTime) / 1000);
        const remaining = Math.max(0, TIMER_SECONDS - elapsed);
        setTimeLeft(remaining);
        if (remaining === 0) {
          clearInterval(interval);
          if (role === 'player' && !hasAnswered) {
             setHasAnswered(true);
          }
        }
      }, 500);
      return () => clearInterval(interval);
    }
  }, [gameState, role, hasAnswered]);

  useEffect(() => {
    if (gameState && !gameState.showResults) {
      setHasAnswered(false);
      setLastAnswerCorrect(null);
      setLastPointsEarned(0);
      setTimeLeft(TIMER_SECONDS);
    }
  }, [gameState?.currentQuestionIndex, gameState?.showResults, gameState?.status]);

  const createRoom = async () => {
    if (!user || !db) return;
    setLoadingAction(true);
    try {
      const code = Math.random().toString(36).substring(2, 6).toUpperCase();
      const roomRef = doc(db, 'artifacts', appId, 'public', 'data', 'rooms', code);
      await setDoc(roomRef, {
        code, status: 'lobby', currentQuestionIndex: 0, showResults: false,
        hostId: user.uid, createdAt: Date.now(), questionStartTime: 0
      });
      sessionStorage.setItem('activeRoom', code);
      sessionStorage.setItem('activeRole', 'host');
      setRoomCode(code);
      setRole('host');
    } catch (e) {
      setErrorMessage("Errore creazione stanza.");
    } finally {
      setLoadingAction(false);
    }
  };

  const startQuiz = async () => {
    if (!roomCode || !db) return;
    const roomRef = doc(db, 'artifacts', appId, 'public', 'data', 'rooms', roomCode);
    await updateDoc(roomRef, { 
      status: 'playing', currentQuestionIndex: 0, showResults: false,
      questionStartTime: Date.now() 
    });
  };

  const nextQuestion = async () => {
    if (!roomCode || !gameState || !db) return;
    const isLast = gameState.currentQuestionIndex === QUIZ_DATA.questions.length - 1;
    const roomRef = doc(db, 'artifacts', appId, 'public', 'data', 'rooms', roomCode);
    if (gameState.showResults) {
      if (isLast) await updateDoc(roomRef, { status: 'finished' });
      else await updateDoc(roomRef, { 
        currentQuestionIndex: increment(1), showResults: false, questionStartTime: Date.now() 
      });
    } else {
      await updateDoc(roomRef, { showResults: true });
    }
  };

  const joinRoom = async () => {
    if (!user || !db) return;
    const cleanName = playerName.trim();
    const cleanCode = roomCode.trim().toUpperCase();
    if (!cleanCode || !cleanName) { setErrorMessage("Inserisci nome e codice!"); return; }
    setLoadingAction(true);
    try {
      const roomRef = doc(db, 'artifacts', appId, 'public', 'data', 'rooms', cleanCode);
      const snap = await getDoc(roomRef);
      if (snap.exists()) {
        const playerRef = doc(db, 'artifacts', appId, 'public', 'data', 'players', `${cleanCode}_${user.uid}`);
        
        const existingPlayer = await getDoc(playerRef);
        if (!existingPlayer.exists()) {
          await setDoc(playerRef, { 
            uid: user.uid, name: cleanName, roomCode: cleanCode, score: 0, 
            lastAnswerIndex: -1, lastQuestionIndexAnswered: -1, lastAnsweredAt: 0 
          });
        }
        
        sessionStorage.setItem('activeRoom', cleanCode);
        sessionStorage.setItem('activeRole', 'player');
        sessionStorage.setItem('activePlayerName', cleanName);
        
        setRoomCode(cleanCode);
        setRole('player');
      } else setErrorMessage("Codice non trovato.");
    } catch (e) { setErrorMessage("Errore di rete."); } finally { setLoadingAction(false); }
  };

  const submitAnswer = async (index) => {
    if (hasAnswered || timeLeft === 0 || !gameState || gameState.showResults || !user || !db) return;
    const isCorrect = QUIZ_DATA.questions[gameState.currentQuestionIndex].options[index].isCorrect;
    const now = Date.now();
    const timeTaken = (now - gameState.questionStartTime) / 1000;
    const timeRatio = Math.min(1, timeTaken / TIMER_SECONDS); 
    const earnedPoints = isCorrect ? Math.floor(500 + (500 * (1 - timeRatio))) : 0;
    setHasAnswered(true);
    setLastAnswerCorrect(isCorrect);
    setLastPointsEarned(earnedPoints);
    const playerRef = doc(db, 'artifacts', appId, 'public', 'data', 'players', `${roomCode}_${user.uid}`);
    await updateDoc(playerRef, {
      score: increment(earnedPoints),
      lastAnswerIndex: index,
      lastQuestionIndexAnswered: gameState.currentQuestionIndex,
      lastAnsweredAt: now 
    });
  };

  const copyLink = () => {
    let baseUrl = window.location.origin + "/";
    if (localIp && localIp.trim() !== "") baseUrl = `http://${localIp.trim()}:3000/`;
    const fullUrl = `${baseUrl}?room=${roomCode}`;
    const el = document.createElement('textarea');
    el.value = fullUrl;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getQrUrl = () => {
    let baseUrl = window.location.origin + "/";
    if (localIp && localIp.trim() !== "") {
      baseUrl = `http://${localIp.trim()}:3000/`;
    }
    const joinUrl = `${baseUrl}?room=${roomCode}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(joinUrl)}&bgcolor=ffffff&color=0054a6&margin=10`;
  };

  const isFastestPlayer = useMemo(() => {
    if (!gameState || gameState.status !== 'playing' || !gameState.showResults) return false;
    const currentQIndex = gameState.currentQuestionIndex;
    const q = QUIZ_DATA.questions[currentQIndex];
    const correctPlayersAtThisRound = players.filter(p => {
      return p.lastQuestionIndexAnswered === currentQIndex && p.lastAnsweredAt > 0 && q.options?.[p.lastAnswerIndex]?.isCorrect === true;
    });
    if (correctPlayersAtThisRound.length === 0) return false;
    const minTime = Math.min(...correctPlayersAtThisRound.map(p => p.lastAnsweredAt));
    const me = players.find(p => p.uid === user?.uid);
    return me && me.lastQuestionIndexAnswered === currentQIndex && me.lastAnsweredAt === minTime && lastAnswerCorrect;
  }, [players, gameState, user, lastAnswerCorrect]);

  const getRankInfo = (uid) => {
    const rank = players.findIndex(p => p.uid === uid);
    const player = players[rank];
    if (!player || player.score === 0) {
      return { 
        icon: <Coins size={20} className="text-[#ffde00]" />, 
        label: rank !== -1 ? `${rank + 1}` : "-",
        colorClass: "text-white"
      };
    }
    if (rank === 0) return { icon: <Trophy size={20} className="text-[#ffd700]" />, label: "1", colorClass: "text-[#ffd700]" };
    if (rank === 1) return { icon: <Trophy size={20} className="text-[#c0c0c0]" />, label: "2", colorClass: "text-[#c0c0c0]" };
    if (rank === 2) return { icon: <Trophy size={20} className="text-[#cd7f32]" />, label: "3", colorClass: "text-[#cd7f32]" };
    return { icon: <Coins size={20} className="text-[#ffde00]" />, label: `${rank + 1}`, colorClass: "text-white" };
  };

  if (authLoading) return <div className="min-h-screen bg-white flex items-center justify-center text-[#0054a6] font-black"><Loader2 className="animate-spin mr-2" /> Caricamento...</div>;

  if (role && !gameState) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center text-[#0054a6] font-black p-6">
        <LogoArcigay className="h-20 mb-8 opacity-50 grayscale" />
        <Loader2 className="animate-spin mb-4" size={48} />
        <h2 className="text-2xl uppercase">Sincronizzazione...</h2>
        <p className="text-gray-400 mt-2 font-black">Recupero dati della stanza in corso</p>
      </div>
    );
  }

  if (!role) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 font-sans font-black">
        <div className="max-w-md w-full bg-white p-10 rounded-3xl shadow-xl border border-gray-200">
          <div className="text-center mb-10 font-black">
            <LogoArcigay className="h-24 mx-auto mb-6 object-contain font-black" />
            <h1 className="text-3xl font-black text-[#0054a6] uppercase leading-none">Pride House Quiz</h1>
            <p className="text-gray-500 text-sm font-bold uppercase tracking-widest mt-2">Giochi Olimpici Invernali</p>
          </div>
          {errorMessage && <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl mb-6 text-sm font-bold flex items-center gap-2 uppercase font-black"><AlertCircle size={16}/> {errorMessage}</div>}
          <div className="space-y-5 font-black">
            <input type="text" placeholder="Nome Squadra / Player" className="w-full bg-gray-50 border border-gray-300 rounded-xl px-5 py-4 focus:ring-2 focus:ring-[#0054a6] outline-none text-[#0054a6] font-bold text-lg font-black" value={playerName} onChange={(e) => setName(e.target.value)} />
            <input type="text" placeholder="Codice Stanza" className="w-full bg-gray-50 border border-gray-300 rounded-xl px-5 py-4 uppercase font-mono font-black text-center focus:ring-2 focus:ring-[#0054a6] outline-none text-[#0054a6] text-xl font-black" value={roomCode} onChange={(e) => setRoomCode(e.target.value)} />
            <button onClick={joinRoom} disabled={loadingAction} className="w-full bg-[#0054a6] hover:bg-[#00448a] py-5 rounded-2xl font-black shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 text-white text-xl uppercase">PARTECIPA ORA</button>
            <button onClick={createRoom} className="w-full bg-white hover:bg-gray-50 text-[#0054a6] py-3 rounded-xl border-2 border-[#0054a6] flex items-center justify-center gap-2 text-sm transition-all font-black uppercase tracking-widest"><Users size={16}/> Crea Stanza (Host)</button>
          </div>
        </div>
      </div>
    );
  }

  if (role === 'host') {
    const currentQ = QUIZ_DATA.questions[gameState?.currentQuestionIndex || 0];
    const answersCount = players.filter(p => p.lastQuestionIndexAnswered === gameState?.currentQuestionIndex).length;

    return (
      <div className="h-screen bg-gray-50 text-gray-900 p-4 flex flex-col overflow-hidden font-sans font-black">
        <header className="flex justify-between items-center mb-3 bg-white p-4 rounded-2xl border border-gray-200 shadow-md font-black">
          <div className="flex items-center gap-6 text-[#0054a6] font-black">
            <LogoArcigay className="h-16 object-contain font-black" />
            <div className="h-8 w-px bg-gray-200" />
            <div className="font-black">
              <h1 className="text-[12px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">In corso alla Pride House</h1>
              <p className="font-bold text-[#0054a6] text-xl leading-none">{QUIZ_DATA.title}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 font-black">
            <button onClick={() => setShowHelp(!showHelp)} className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-full text-[10px] font-bold flex items-center gap-2 border border-gray-300 transition-all text-gray-600 uppercase tracking-widest font-black"><ShieldAlert size={14} className="text-[#0054a6]" /> Supporto</button>
            <div className="bg-[#0054a6] px-5 py-2 rounded-full flex items-center gap-3 border border-[#00448a] text-white font-black">
              <Users size={18} /><span className="font-black text-xl">{players.length}</span>
            </div>
          </div>
        </header>

        {showHelp && (
          <div className="mb-4 p-5 bg-blue-50 border-2 border-[#0054a6]/20 rounded-2xl font-black">
            <div className="grid md:grid-cols-3 gap-6 text-sm text-[#0054a6] font-black">
              <div className="space-y-1"><p className="font-bold flex items-center gap-2 uppercase tracking-widest font-black"><Wifi size={16}/> Wi-Fi</p><p className="font-medium font-black">Tutti i dispositivi sulla stessa rete locale.</p></div>
              <div className="space-y-1 font-black font-black"><p className="font-bold flex items-center gap-2 uppercase tracking-widest font-black"><Globe size={16}/> IP Locale</p><p className="font-medium font-black">Inserisci l'IP dell'Host nel box sotto.</p></div>
              <div className="space-y-1 font-black font-black font-black"><p className="font-bold flex items-center gap-2 uppercase tracking-widest font-black font-black"><Settings size={16}/> Firewall</p><p className="font-medium font-black">Sblocca porta 3000.</p></div>
            </div>
          </div>
        )}

        <div className="flex-1 flex gap-6 overflow-hidden font-black">
          <div className="flex-1 flex flex-col gap-6 overflow-hidden font-black">
            {gameState?.status === 'lobby' && (
              <div className="flex-1 grid lg:grid-cols-2 gap-10 items-center max-w-6xl mx-auto w-full font-black">
                <div className="space-y-8 text-center lg:text-left font-black">
                  <h2 className="text-8xl font-black tracking-tighter text-[#0054a6] uppercase leading-none font-black">Siete pronti?</h2>
                  <div className="inline-block bg-white p-8 rounded-[3rem] border border-gray-200 shadow-2xl w-full max-w-lg font-black font-black">
                    <p className="text-sm font-black text-gray-400 uppercase tracking-widest mb-2">Codice d'accesso</p>
                    <p className="text-8xl font-mono font-black text-[#0054a6] tracking-widest drop-shadow-sm">{roomCode}</p>
                    <div className="mt-6 p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-3 font-black">
                      <p className="text-xs font-bold text-gray-500 uppercase font-black">Setup Rete Local IP</p>
                      <input type="text" placeholder="IP del PC (es: 192.168.1.15)" className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#0054a6] transition-all text-[#0054a6] font-mono font-bold font-black" value={localIp} onChange={(e) => setLocalIp(e.target.value)} />
                    </div>
                    <button onClick={copyLink} className="mt-4 flex items-center gap-2 mx-auto lg:mx-0 text-[#0054a6] hover:underline text-xs font-bold uppercase font-black">{copied ? <Check size={14}/> : <Copy size={14}/>} {copied ? "Copiato!" : "Copia Link Condivisione"}</button>
                  </div>
                  <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                    {players.map(p => <div key={p.uid} className="bg-white border border-gray-200 text-[#0054a6] px-5 py-2.5 rounded-full text-lg font-black shadow-md animate-in zoom-in">{p.name}</div>)}
                  </div>
                  <button onClick={startQuiz} disabled={players.length === 0} className="w-full lg:w-auto px-16 py-6 bg-[#0054a6] hover:bg-[#00448a] disabled:opacity-30 rounded-2xl text-3xl font-black shadow-xl flex items-center justify-center gap-4 transition-all active:scale-95 text-white uppercase"><Play fill="currentColor" size={32} /> INIZIA IL QUIZ</button>
                </div>
                <div className="flex flex-col items-center">
                  <div className="bg-white p-8 rounded-[4rem] shadow-2xl border-4 border-[#0054a6]/10">
                    <img src={getQrUrl()} alt="QR" className="w-80 h-80 rounded-2xl font-black" />
                    <div className="mt-6 text-center font-black">
                       <div className="flex items-center justify-center gap-3 text-[#0054a6] mb-1 font-black">
                          <QrCode size={24} /><span className="font-black text-2xl uppercase tracking-tighter">INQUADRA E GIOCA</span>
                       </div>
                       <p className="text-xs font-bold text-gray-400 uppercase tracking-widest font-black">Accesso alla Pride House</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {(gameState?.status === 'playing' || gameState?.status === 'finished') && (
              <div className={`flex-1 grid gap-6 ${gameState.showResults ? 'lg:grid-cols-4' : 'grid-cols-1'} transition-all duration-500 overflow-hidden font-black`}>
                <div className={`${gameState.showResults ? 'lg:col-span-3' : 'col-span-1'} flex flex-col h-full overflow-hidden font-black`}>
                  <div key={gameState.currentQuestionIndex} className="bg-white p-8 rounded-[3rem] border border-gray-200 shadow-2xl flex-1 flex flex-col relative overflow-y-auto custom-scrollbar font-black">
                    <div className="relative z-10 flex-1 flex flex-col justify-start font-black">
                      <div className="flex justify-between items-center mb-6 font-black font-black">
                        <span className="bg-[#0054a6] text-white px-6 py-2 rounded-full font-black text-sm uppercase tracking-widest leading-none shadow-md font-bold">DOMANDA {gameState?.currentQuestionIndex + 1} / {QUIZ_DATA.questions.length}</span>
                        {!gameState.showResults && (
                          <div className="flex items-center gap-8 font-black">
                            <div className="flex items-center gap-3 bg-blue-50 px-6 py-3 rounded-full border border-blue-100 font-black">
                              <CheckSquare className="text-[#0054a6]" size={24} />
                              <span className="text-2xl font-black text-[#0054a6]">{answersCount} / {players.length} <span className="text-xs text-gray-400 uppercase ml-1">Risposte</span></span>
                            </div>
                            <div className="flex items-center gap-3 bg-gray-900 px-7 py-3 rounded-full shadow-lg font-black">
                              <Clock className={`${timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-[#ffde00]'}`} size={28} />
                              <span className={`text-4xl font-black font-mono ${timeLeft < 10 ? 'text-red-500' : 'text-white'}`}>{timeLeft}s</span>
                            </div>
                          </div>
                        )}
                      </div>

                      <h2 className={`font-black leading-tight text-[#0054a6] tracking-tight ${gameState?.showResults ? 'text-4xl mt-6 mb-10' : 'text-7xl text-center mt-20 mb-24'}`}>
                        {currentQ?.question}
                      </h2>
                      
                      <div className={`grid gap-5 ${gameState?.showResults ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-2 max-w-6xl mx-auto w-full'} font-black`}>
                        {currentQ?.options?.map((opt, i) => (
                          <div key={i} className="flex flex-col gap-3 font-black">
                            <div className={`p-6 rounded-[2.5rem] border-4 flex items-center gap-6 transition-all ${gameState?.showResults ? (opt.isCorrect ? 'border-[#009640] bg-[#009640]/5 shadow-lg scale-102 font-bold' : 'border-gray-100 opacity-30 grayscale') : 'border-gray-100 bg-gray-50 shadow-inner font-black'}`}>
                              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${COLORS[i]} shadow-xl text-4xl font-black text-white`}>{String.fromCharCode(65 + i)}</div>
                              <span className={`flex-1 text-[#0054a6] font-black leading-tight break-words font-black ${gameState?.showResults ? 'text-2xl' : 'text-3xl font-black'}`}>{opt.text}</span>
                              {gameState?.showResults && opt.isCorrect && <CheckCircle2 className="text-[#009640] shrink-0 font-black" size={40} />}
                            </div>
                            {gameState?.showResults && (
                              <div className={`px-8 py-5 rounded-3xl animate-in fade-in slide-in-from-left-4 font-black ${opt.isCorrect ? 'text-[#009640] bg-[#009640]/10 border border-[#009640]/20' : 'text-gray-500 bg-gray-100 border border-gray-200'}`}>
                                <span className="font-black uppercase text-xs block mb-2 tracking-[0.2em] opacity-60"> {opt.isCorrect ? "RISPOSTA CORRETTA" : "INFO OPZIONE"} </span>
                                <p className="leading-relaxed font-bold font-black text-2xl font-black">{opt.rationale}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="pt-4 font-black">
                    <button onClick={nextQuestion} className="w-full py-6 bg-[#0054a6] hover:bg-[#00448a] rounded-[2.5rem] text-4xl font-black shadow-2xl flex items-center justify-center gap-6 transition-all active:scale-95 text-white uppercase font-black">
                      {gameState?.showResults ? (gameState?.currentQuestionIndex === QUIZ_DATA.questions.length - 1 ? "PODIO FINALE" : "PROSSIMA DOMANDA") : "SCOPRI LA RISPOSTA"} <ChevronRight size={48} className="font-black" />
                    </button>
                  </div>
                </div>
                
                {gameState?.showResults && (
                  <div className="bg-white rounded-[3.5rem] p-8 border border-gray-200 flex flex-col shadow-2xl animate-in slide-in-from-right-8 overflow-hidden">
                    <h3 className="text-lg font-black mb-6 flex items-center gap-3 text-[#0054a6] uppercase tracking-[0.3em] font-black"><Trophy className="text-[#0054a6]" size={24} /> CLASSIFICA</h3>
                    <div className="space-y-4 flex-1 overflow-y-auto pr-1 custom-scrollbar font-black text-[#0054a6]">
                      {players.map((p, i) => (
                        <div key={p.uid} className={`flex items-center justify-between p-5 rounded-[2rem] border transition-all ${i === 0 ? 'bg-[#ffde00]/30 border-[#ffde00] shadow-lg font-black' : 'bg-gray-50 border-gray-100'}`}>
                          <div className="flex items-center gap-4 text-[#0054a6] font-black">
                            <span className="font-black text-gray-400 text-lg font-black font-black">#{i+1}</span>
                            <span className="font-black truncate max-w-[120px] text-xl uppercase tracking-tight">{p.name}</span>
                          </div>
                          <span className="font-black text-[#0054a6] text-2xl font-mono">{p.score}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Colonna Laterale Persistente (QR e Codice) */}
          {gameState?.status !== 'lobby' && gameState?.status !== 'finished' && (
            <div className="w-64 flex flex-col gap-6 animate-in slide-in-from-right-10 font-black">
              <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-gray-200 text-center font-black">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Codice Stanza</p>
                <p className="text-5xl font-mono font-black text-[#0054a6]">{roomCode}</p>
              </div>
              <div className="bg-white p-5 rounded-[2.5rem] shadow-xl border-4 border-[#0054a6]/10">
                <img src={getQrUrl()} alt="QR" className="w-full h-auto rounded-xl font-black" />
                <div className="mt-4 text-center font-black font-black">
                   <p className="text-[10px] font-black text-[#0054a6] uppercase tracking-tighter">SCAN TO JOIN</p>
                </div>
              </div>
              <div className="mt-auto bg-[#0054a6] p-4 rounded-[2rem] text-white text-center font-black">
                <p className="text-[10px] font-black uppercase tracking-widest mb-1">Domanda</p>
                <p className="text-2xl font-black">{gameState?.currentQuestionIndex + 1} / {QUIZ_DATA.questions.length}</p>
              </div>
            </div>
          )}
        </div>

        {gameState?.status === 'finished' && (
          <div className="fixed inset-0 bg-gray-50 z-50 flex flex-col items-center justify-center animate-in zoom-in text-center font-black">
             <Crown size={180} className="text-[#ffde00] mb-10 animate-bounce font-black" />
             <h2 className="text-9xl font-black tracking-tighter mb-20 text-[#0054a6] leading-none uppercase italic font-black">I CAMPIONI!</h2>
             <div className="flex items-end gap-12 w-full max-w-6xl h-96">
                {players[1] && <div className="flex-1 flex flex-col items-center font-black font-black"><p className="font-black text-3xl mb-4 truncate text-[#0054a6] uppercase font-black"> {players[1].name} </p><div className="w-full bg-gray-200 h-48 rounded-t-[3rem] flex items-center justify-center text-8xl font-black text-gray-400 border-t-8 border-gray-300 shadow-xl font-black">2</div></div>}
                {players[0] && <div className="flex-1 flex flex-col items-center"> <p className="font-black text-5xl text-[#0054a6] mb-8 drop-shadow-lg uppercase tracking-widest font-black font-black"> {players[0].name} </p><div className="w-full bg-gradient-to-b from-[#ffde00] to-[#e6c800] h-72 rounded-t-[4rem] flex items-center justify-center text-[10rem] font-black text-[#0054a6] shadow-2xl border-t-8 border-[#ffde00]">1</div></div>}
                {players[2] && <div className="flex-1 flex flex-col items-center font-black font-black"> <p className="font-black text-3xl mb-4 truncate text-[#0054a6] uppercase font-black"> {players[2].name} </p><div className="w-full bg-orange-100 h-36 rounded-t-[3rem] flex items-center justify-center text-7xl font-black text-orange-300 border-t-8 border-orange-200 shadow-xl font-black">3</div></div>}
             </div>
             <button onClick={() => window.location.reload()} className="mt-24 px-20 py-6 bg-gray-900 hover:bg-black rounded-full text-white font-black tracking-widest uppercase transition-all text-xl shadow-2xl">NUOVA PARTITA</button>
          </div>
        )}

        <style>{`
          .custom-scrollbar::-webkit-scrollbar { width: 8px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
        `}</style>
      </div>
    );
  }

  if (role === 'player') {
    const isAnswering = gameState?.status === 'playing' && !gameState?.showResults;
    const rankData = getRankInfo(user?.uid);
    const myRankIndex = players.findIndex(p => p.uid === user?.uid);
    const myPlayer = players[myRankIndex];

    return (
      <div className="min-h-screen bg-white text-[#0054a6] flex flex-col font-sans select-none overflow-hidden text-center font-black">
        <header className="p-4 bg-white border-b-4 border-[#ffde00] flex justify-between items-center shadow-md font-black">
          <LogoArcigay className="h-14 object-contain font-black" />
          {!isAnswering && (
            <div className="bg-[#0054a6] px-5 py-2 rounded-full flex items-center gap-2 text-white font-black">
              {rankData.icon}<span className="font-black text-xl font-mono">{myPlayer?.score || 0}</span>
            </div>
          )}
        </header>

        <main className="flex-1 p-6 flex flex-col items-center justify-center relative bg-gray-50 font-black font-black">
          {gameState?.status === 'lobby' && (
            <div className="text-center space-y-6 animate-in fade-in max-w-sm font-black font-black font-black">
              <div className="w-24 h-24 bg-[#0054a6]/10 rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-[#0054a6]/20 animate-pulse text-[#0054a6] font-black"><Users size={48} /></div>
              <h2 className="text-3xl font-black uppercase tracking-tighter leading-tight font-black font-black">Benvenuti alla Pride House!</h2>
              <p className="text-gray-500 text-lg font-bold font-black">In attesa dell'inizio...</p>
              <p className="pt-8 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center uppercase font-black">Connesso come: {playerName}</p>
            </div>
          )}

          {isAnswering && (
            <div key={gameState?.currentQuestionIndex} className="w-full max-w-sm flex flex-col h-full space-y-4 animate-in fade-in zoom-in font-black">
              <div className="text-center space-y-1 font-black">
                <p className="text-gray-400 font-black text-[10px] uppercase tracking-widest font-black">Domanda {(gameState?.currentQuestionIndex || 0) + 1}</p>
                <div className="flex items-center justify-center gap-2 font-black">
                  <Clock size={28} className={`${timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-[#0054a6]'} font-black`} />
                  <p className={`text-5xl font-black font-mono ${timeLeft < 10 ? 'text-red-500' : 'text-[#0054a6]'} font-black`}>{timeLeft}s</p>
                </div>
              </div>
              {hasAnswered ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white border-4 border-dashed border-[#0054a6]/20 rounded-[3rem] shadow-inner animate-pulse font-black">
                  <Loader2 className="animate-spin text-[#0054a6] mb-6 font-black" size={48}/><h2 className="text-3xl font-black uppercase text-[#0054a6] leading-none font-black">Acquisita</h2><p className="text-gray-400 mt-4 font-bold uppercase text-[10px] tracking-widest font-black">Guarda lo schermo principale</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 flex-1 font-black">
                  {COLORS.map((color, i) => (
                    <button key={i} onClick={() => submitAnswer(i)} className={`flex-1 rounded-[2.5rem] ${color} shadow-xl active:shadow-none active:translate-y-2 transition-all flex items-center justify-center text-6xl font-black text-white border-b-8 border-black/20 uppercase font-black`}>{String.fromCharCode(65 + i)}</button>
                  ))}
                </div>
              )}
            </div>
          )}

          {gameState?.status === 'playing' && gameState.showResults && (
            <div className={`w-full max-w-[95%] p-10 rounded-[4rem] flex flex-col items-center justify-center text-center shadow-2xl transition-all border-b-8 animate-in zoom-in font-black ${lastAnswerCorrect === true ? 'bg-[#009640] border-[#007030]' : 'bg-[#e30613] border-[#b0050f]'}`}>
              <div className="bg-white/20 w-28 h-28 rounded-full flex items-center justify-center mb-6 shadow-inner text-white font-black">
                {lastAnswerCorrect === true ? <CheckCircle2 size={72}/> : <XCircle size={72}/>}
              </div>
              
              <h2 className="text-5xl font-black mb-6 text-white uppercase tracking-tighter leading-none text-center font-black">
                {lastAnswerCorrect === true ? 'RISPOSTA ESATTA!' : (timeLeft === 0 && lastAnswerCorrect === null ? 'TEMPO SCADUTO' : 'RISPOSTA ERRATA')}
              </h2>
              
              <div className="text-white text-xl font-black tracking-widest uppercase flex flex-col gap-4 text-center w-full font-black">
                {lastAnswerCorrect === true ? (
                  <div className="flex flex-col items-center justify-center gap-2 font-black font-black">
                    <div className="flex items-center gap-2 font-black">
                      {isFastestPlayer && <Zap className="text-[#ffde00] fill-[#ffde00] animate-bounce font-black" size={28} />}
                      <span className="font-black text-center">+{lastPointsEarned} PT</span>
                    </div>
                    {isFastestPlayer && (
                      <p className="mt-1 text-sm font-black text-[#ffde00] uppercase tracking-[0.2em] animate-pulse text-center uppercase font-black">Velocità Massima!</p>
                    )}
                  </div>
                ) : (
                  <span className="text-lg font-black"> 0 PUNTI </span>
                )}
                
                <div className="mt-4 pt-6 border-t border-white/20 text-center uppercase w-full font-black">
                   <p className="text-sm text-white/70 mb-2 font-black">Posizione in classifica:</p>
                   <p className={`text-7xl ${rankData.colorClass} drop-shadow-sm font-black leading-none`}>
                      {rankData.label}{rankData.label !== "-" ? "°" : ""}
                   </p>
                </div>
              </div>
            </div>
          )}

          {gameState?.status === 'finished' && (
            <div className="text-center space-y-10 text-[#0054a6] font-black font-black">
              {myRankIndex >= 0 && myRankIndex <= 2 && myPlayer?.score > 0 ? (
                <Trophy 
                  size={120} 
                  className={`mx-auto drop-shadow-2xl ${myRankIndex === 0 ? 'text-[#ffd700]' : myRankIndex === 1 ? 'text-[#c0c0c0]' : 'text-[#cd7f32]'}`} 
                />
              ) : (
                <Smile size={120} className="mx-auto text-[#0054a6] opacity-80" />
              )}
              <h2 className="text-5xl font-black uppercase tracking-tighter leading-tight text-center uppercase font-black">FINE!</h2>
              <div className="bg-white p-10 rounded-[3rem] border-2 border-gray-100 shadow-xl text-center uppercase font-black">
                <p className="text-xs text-gray-400 uppercase font-black tracking-widest mb-3">Punteggio Finale</p>
                <div className="flex flex-col items-center justify-center gap-2 mb-4 font-black">
                    <p className="text-sm text-gray-500 uppercase font-black">Posizione finale:</p>
                    <span className={`text-5xl font-black ${rankData.colorClass === 'text-white' ? 'text-[#0054a6]' : rankData.colorClass}`}>
                      {rankData.label}°
                    </span>
                </div>
                <p className="text-7xl font-black font-mono leading-none tracking-tighter font-black">{myPlayer?.score || 0}</p>
              </div>
            </div>
          )}
        </main>
      </div>
    );
  }
  return null;
}