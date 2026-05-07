// game.js
// this file has the math stuff and game logic
// I put it in a separate file to keep index.html cleaner

// ---- RK4 solver ----
// rk4 solves the differential equation step by step
// basically you take small steps from t0 to tf and estimate y at each step
function rk4(f, y0, t0, tf, h) {
    if (h == undefined) {
        h = 0.01
    }

    var points = []  // this will store all the t,y pairs
    var t = t0
    var y = y0

    points.push({t: t, y: y})

    while (t < tf - 0.000001) {
        // make sure we don't go past tf
        if (t + h > tf) {
            h = tf - t
        }

        // k1 is the slope at the beginning
        var k1 = f(t, y)

        // k2 is the slope at the midpoint using k1
        var k2 = f(t + h/2, y + (h/2)*k1)

        // k3 is also the slope at the midpoint but using k2 instead
        // this gives a better estimate than k2
        var k3 = f(t + h/2, y + (h/2)*k2)

        // k4 is the slope at the end of the step
        var k4 = f(t + h, y + h*k3)

        // weighted average of the four slopes
        // the middle ones (k2 and k3) count double
        var newY = y + (h/6) * (k1 + 2*k2 + 2*k3 + k4)

        t = t + h
        y = newY

        points.push({t: t, y: y})
    }

    return points
}


// ---- helpers ----

// get a random number between min and max
function getRandom(min, max) {
    return min + Math.random() * (max - min)
}

// round to n decimal places
function roundNum(x, n) {
    return Math.round(x * Math.pow(10, n)) / Math.pow(10, n)
}


// ---- ODE types ----
// this picks one of 4 ODEs randomly and sets random parameters
// returns an object with the function, initial condition, and latex string

function makeODE() {
    var which = Math.floor(Math.random() * 4)
    console.log("picked ODE type: " + which)

    if (which == 0) {
        // exponential: y' = k*y
        var k = roundNum(getRandom(-0.5, 0.5), 2)
        var y0 = roundNum(getRandom(1, 5), 1)

        return {
            f: function(t, y) { return k * y },
            y0: y0,
            latex: "y' = " + k + "y",
            params: {k: k, y0: y0}
        }
    }

    if (which == 1) {
        // logistic: y' = r*y*(1 - y/K)
        var r = roundNum(getRandom(0.1, 1.0), 2)
        var K = roundNum(getRandom(5, 20), 1)
        var y0 = roundNum(getRandom(1, 4), 1)

        return {
            f: function(t, y) { return r * y * (1 - y/K) },
            y0: y0,
            latex: "y' = " + r + "y\\left(1 - \\dfrac{y}{" + K + "}\\right)",
            params: {r: r, K: K, y0: y0}
        }
    }

    if (which == 2) {
        // linear with forcing term: y' = -a*y + b
        var a = roundNum(getRandom(0.1, 1.0), 2)
        var b = roundNum(getRandom(1, 5), 1)
        var y0 = roundNum(getRandom(0, 3), 1)

        return {
            f: function(t, y) { return -a*y + b },
            y0: y0,
            latex: "y' = -" + a + "y + " + b,
            params: {a: a, b: b, y0: y0}
        }
    }

    // newtons cooling: y' = -k*(y - Tenv)
    var k = roundNum(getRandom(0.1, 0.8), 2)
    var Tenv = roundNum(getRandom(15, 25), 1)
    var y0 = roundNum(getRandom(50, 90), 1)

    return {
        f: function(t, y) { return -k * (y - Tenv) },
        y0: y0,
        latex: "y' = -" + k + "(y - " + Tenv + ")",
        params: {k: k, Tenv: Tenv, y0: y0}
    }
}


// ---- game state ----
// I'm just using a global object to track everything

var NUM_ROUNDS = 10
var T_END = 5  // we always evaluate at t=5

var game = {
    rounds: [],
    currentRound: 0,
    score: 0,
    streak: 0,
    bestStreak: 0,
    phase: "guessing",  // can be "guessing", "revealing", or "done"
    lastAnswer: null
}


// sets up a new game - generates all 10 rounds
function initGame() {
    game.rounds = []
    game.currentRound = 0
    game.score = 0
    game.streak = 0
    game.bestStreak = 0
    game.phase = "guessing"
    game.lastAnswer = null

    for (var i = 0; i < NUM_ROUNDS; i++) {
        game.rounds.push(makeODE())
    }

    console.log("game initialized with " + NUM_ROUNDS + " rounds")
}


// runs rk4 on the current round and saves the result
function solveRound() {
    var r = game.rounds[game.currentRound]
    var traj = rk4(r.f, r.y0, 0, T_END, 0.01)
    r.trajectory = traj
    r.answer = traj[traj.length - 1].y  // last y value is y(5)
    console.log("round " + game.currentRound + " answer: " + r.answer)
}


// checks if the guess was right, updates score
// returns true if correct
function checkGuess(guess) {
    var answer = game.rounds[game.currentRound].answer
    var prev = game.lastAnswer

    var correct = false

    if (guess == "higher" && answer > prev) {
        correct = true
    }
    if (guess == "lower" && answer < prev) {
        correct = true
    }
    // if they're equal, neither is right (probably won't happen)

    if (correct) {
        game.score = game.score + 1
        game.streak = game.streak + 1
        if (game.streak > game.bestStreak) {
            game.bestStreak = game.streak
        }
    } else {
        game.streak = 0
    }

    game.phase = "revealing"
    return correct
}


// moves to the next round
function nextRound() {
    game.lastAnswer = game.rounds[game.currentRound].answer
    game.currentRound = game.currentRound + 1

    if (game.currentRound >= NUM_ROUNDS) {
        game.phase = "done"
    } else {
        game.phase = "guessing"
        solveRound()
    }
}