import { useState, useEffect } from 'react'
import { FaSun, FaMoon } from 'react-icons/fa'

function App() {
  const defaultState = {
    totalCoins: 0,
    totalBattery: 150,
    levelOfClicks: 1,
    levelOfBattery: 150,
    levelOfCharge: 10,
    costForClick: 100,
    costForBattery: 200,
    costForCharge: 150,
    darkMode: false,
    selectedBadge: 'tripi',
    ownedBadges: ['tripi']
  }

  const loadFromStorage = () => {
    const saved = localStorage.getItem('brainrotGame')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (err) {
        console.error("Failed to parse save:", err)
      }
    }
    return defaultState
  }

  const savedData = loadFromStorage()

  // --- State ---
  const [totalCoins, setTotalCoins] = useState(savedData.totalCoins)
  const [totalBattery, setTotalBattery] = useState(savedData.totalBattery)
  const [levelOfClicks, setLevelOfClicks] = useState(savedData.levelOfClicks)
  const [levelOfBattery, setLevelOfBattery] = useState(savedData.levelOfBattery)
  const [levelOfCharge, setLevelOfCharge] = useState(savedData.levelOfCharge)
  const [costForClick, setCostForClick] = useState(savedData.costForClick)
  const [costForBattery, setCostForBattery] = useState(savedData.costForBattery)
  const [costForCharge, setCostForCharge] = useState(savedData.costForCharge)
  const [darkMode, setDarkMode] = useState(savedData.darkMode)
  const [selectedBadge, setSelectedBadge] = useState(savedData.selectedBadge)
  const [ownedBadges, setOwnedBadges] = useState(savedData.ownedBadges)
  const [showBonus, setShowBonus] = useState(false)
  const [badges, setBadges] = useState([])
  const [loading, setLoading] = useState(true)
  const [showBadges, setShowBadges] = useState(false)

  // --- Save game ---
  useEffect(() => {
    const data = {
      totalCoins,
      totalBattery,
      levelOfClicks,
      levelOfBattery,
      levelOfCharge,
      costForClick,
      costForBattery,
      costForCharge,
      darkMode,
      selectedBadge,
      ownedBadges
    }
    localStorage.setItem('brainrotGame', JSON.stringify(data))
  }, [
    totalCoins,
    totalBattery,
    levelOfClicks,
    levelOfBattery,
    levelOfCharge,
    costForClick,
    costForBattery,
    costForCharge,
    darkMode,
    selectedBadge,
    ownedBadges
  ])

  // --- Load badges ---
  useEffect(() => {
    const loadBadges = async () => {
      try {
        const response = await fetch('/badges.json')
        const data = await response.json()
        setBadges(data.badges)
        setLoading(false)
      } catch (error) {
        console.error('Error loading badges:', error)
        setBadges([
          { id: 'tripi', name: 'Tripi Tropi', emoji: '/brainrot/Tripi_Tropi_Original.webp', cost: 0, description: 'Default badge', rarity: 'common' }
        ])
        setLoading(false)
      }
    }
    loadBadges()
  }, [])

  // --- Rarity multipliers ---
  const rarityMultiplier = {
    common: 1,
    uncommon: 2,
    rare: 3,
    epic: 4,
    legendary: 5,
    "god brainrot": 10,
    secret: 7,
    admin: 15
  }

  // --- Rarity colors ---
  const rarityColors = {
    common: 'border-gray-400',
    uncommon: 'border-blue-400',
    rare: 'border-purple-500',
    epic: 'border-yellow-400',
    legendary: 'border-orange-500',
    "god brainrot": 'border-red-500',
    secret: 'border-pink-500',
    admin: 'border-black'
  }

  // --- Battery charging ---
  useEffect(() => {
    const chargeInterval = setInterval(() => {
      setTotalBattery(prev => Math.min(prev + levelOfCharge, levelOfBattery))
    }, 300) // faster recharge
    return () => clearInterval(chargeInterval)
  }, [levelOfCharge, levelOfBattery])

  // --- Bonus popup ---
  useEffect(() => {
    const bonusInterval = setInterval(() => {
      setShowBonus(true)
      setTimeout(() => setShowBonus(false), 3000)
    }, 15000)
    return () => clearInterval(bonusInterval)
  }, [])

  // --- Game logic ---
  const getCurrentBadge = () => {
    return badges.find(badge => badge.id === selectedBadge) || badges[0] || { emoji: '/brainrot/Tripi_Tropi_Original.webp', rarity: 'common' }
  }

  const handleCoinClick = () => {
    const badge = getCurrentBadge()
    const multiplier = rarityMultiplier[badge.rarity] || 1
    const batteryCost = Math.max(1, Math.floor(levelOfClicks / 2)) // slower battery drain

    if (totalBattery >= batteryCost) {
      setTotalCoins(prev => prev + levelOfClicks * multiplier)
      setTotalBattery(prev => prev - batteryCost)
    } else if (totalBattery > 0) {
      setTotalCoins(prev => prev + totalBattery * multiplier)
      setTotalBattery(0)
    }
  }

  const upgradeClicks = () => {
    if (totalCoins >= costForClick) {
      setTotalCoins(prev => prev - costForClick)
      setLevelOfClicks(prev => prev + 1)
      setCostForClick(prev => Math.ceil(prev * 1.1)) // slower growth
    }
  }

  const upgradeBattery = () => {
    if (totalCoins >= costForBattery) {
      setTotalCoins(prev => prev - costForBattery)
      setLevelOfBattery(prev => prev + 50)
      setCostForBattery(prev => Math.ceil(prev * 1.2))
    }
  }

  const upgradeCharge = () => {
    if (totalCoins >= costForCharge) {
      setTotalCoins(prev => prev - costForCharge)
      setLevelOfCharge(prev => prev + 1)
      setCostForCharge(prev => Math.ceil(prev * 1.2))
    }
  }

  const buyBadge = (badgeId) => {
    const badge = badges.find(b => b.id === badgeId)
    if (!badge) return

    if (totalCoins >= badge.cost && !ownedBadges.includes(badgeId)) {
      setTotalCoins(prev => prev - badge.cost)
      setOwnedBadges(prev => [...prev, badgeId])
    }

    if (ownedBadges.includes(badgeId) || badge.cost === 0) {
      setSelectedBadge(badgeId)
    }
  }

  const batteryPercentage = (totalBattery / levelOfBattery) * 100

  // --- Views ---
  const HomeView = () => (
    <div className="flex flex-col md:flex-row gap-6 p-6">
      {/* Left panel */}
      <div className="w-full md:w-80 bg-white/70 dark:bg-gray-800/70 rounded-2xl p-4 shadow-md flex flex-col">
        <button
          onClick={() => setShowBadges(true)}
          className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg mb-4"
        >
          🎖️ Show Badges
        </button>

        <h2 className="text-xl font-bold mb-4">📊 Stats</h2>
        <div className="space-y-2 mb-6">
          <p>Balance: <span className="font-bold">{totalCoins}$</span></p>
          <p>Per Click: <span className="font-bold">{levelOfClicks}$ x {rarityMultiplier[getCurrentBadge().rarity] || 1}</span></p>
          <p>Battery: <span className="font-bold">{levelOfBattery}🔋</span></p>
          <p>Charge: <span className="font-bold">+{levelOfCharge}⚡</span></p>
        </div>

        <h2 className="text-xl font-bold mb-4">⚡ Boosts</h2>
        <div className="space-y-3">
          <button
            onClick={upgradeClicks}
            disabled={totalCoins < costForClick}
            className="w-full bg-green-500 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            +1👆 ({costForClick}$)
          </button>
          <button
            onClick={upgradeBattery}
            disabled={totalCoins < costForBattery}
            className="w-full bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            +50🔋 ({costForBattery}$)
          </button>
          <button
            onClick={upgradeCharge}
            disabled={totalCoins < costForCharge}
            className="w-full bg-orange-500 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            +1⚡ ({costForCharge}$)
          </button>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
          Brainrot Clicker
        </h1>

        {/* Coin button */}
        <div className="relative mb-6 w-64 h-64">
          <button
            onClick={handleCoinClick}
            className="w-full h-full rounded-full border-8 border-yellow-300 shadow-2xl overflow-hidden"
            disabled={totalBattery === 0}
          >
            <img
              src={getCurrentBadge().emoji}
              alt={getCurrentBadge().name}
              className="w-full h-full object-cover rounded-full"
            />
          </button>

          {showBonus && (
            <button
              onClick={() => {
                setTotalCoins(prev => prev + levelOfClicks * 10)
                setShowBonus(false)
              }}
              className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-purple-500 text-white text-2xl shadow-lg animate-bounce"
            >
              🚀
            </button>
          )}
        </div>

        {/* Battery bar */}
        <div className="w-full max-w-md">
          <div className="flex justify-between mb-2">
            <span>Battery: {totalBattery}🔋</span>
            <span>{Math.round(batteryPercentage)}%</span>
          </div>
          <div className="w-full bg-gray-300 rounded-full h-3 overflow-hidden">
            <div
              className="bg-green-500 h-full transition-all duration-300 rounded-full"
              style={{ width: `${batteryPercentage}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )

  const BadgesView = () => (
    <div className="p-6 max-w-2xl mx-auto">
      <button
        onClick={() => setShowBadges(false)}
        className="mb-6 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
      >
        ⬅️ Back
      </button>
      <h2 className="text-3xl font-bold mb-6 text-center">🎖️ Badges</h2>
      <div className="text-center mb-6">
        <span className="text-2xl font-bold">{totalCoins}$</span>
      </div>
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {badges.map((badge) => (
            <div key={badge.id} className="text-center">
              <button
                onClick={() => buyBadge(badge.id)}
                className={`w-20 h-20 mb-2 border-4 transition-all hover:scale-105 rounded-full
                  ${selectedBadge === badge.id
                    ? 'border-green-500 shadow-lg'
                    : rarityColors[badge.rarity] || 'border-gray-400'
                  }`}
                title={badge.description}
              >
                <img
                  src={badge.emoji}
                  alt={badge.name}
                  className="w-full h-full object-cover rounded-full"
                />
              </button>
              <p className="text-xs font-medium mb-1 truncate">{badge.name}</p>
              <button
                onClick={() => buyBadge(badge.id)}
                disabled={!ownedBadges.includes(badge.id) && totalCoins < badge.cost && badge.cost > 0}
                className={`w-full px-2 py-1 text-xs rounded ${
                  ownedBadges.includes(badge.id)
                    ? 'bg-green-500 text-white'
                    : badge.cost === 0
                      ? 'bg-blue-500 text-white'
                      : totalCoins >= badge.cost
                        ? 'bg-orange-500 text-white hover:bg-orange-600'
                        : 'bg-gray-400 text-white cursor-not-allowed'
                }`}
              >
                {ownedBadges.includes(badge.id)
                  ? 'Owned ✅'
                  : badge.cost === 0
                    ? 'Free'
                    : `${badge.cost.toLocaleString()}$`}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  return (
    <div className={`min-h-screen transition-colors duration-500 ${
      darkMode ? 'bg-gray-900 text-white' : 'bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-900'
    }`}>
      <div className="flex justify-between items-center p-4">
        <h1 className="font-bold">💰 {totalCoins}$</h1>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`p-3 rounded-full transition-colors ${
            darkMode ? 'bg-gray-700 text-yellow-400' : 'bg-white text-gray-700'
          }`}
        >
          {darkMode ? <FaSun size={20} /> : <FaMoon size={20} />}
        </button>
      </div>

      {showBadges ? <BadgesView /> : <HomeView />}
    </div>
  )
}

export default App
