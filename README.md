# Higher Order

A higher-or-lower game for differential equations. Made for my diff eq class.

## What it is

Each round you see a randomly generated first-order ODE with an initial condition. The game solves it numerically using RK4 (4th order Runge-Kutta) and asks you to guess whether y(5) is higher or lower than the previous round's answer. 10 rounds total, 9 guesses.

The point is to build intuition about how ODE parameters affect the solution.

## Files

- `index.html` - main page + UI logic
- `game.js` - RK4 solver, the four ODEs, game state
- `style.css` - styling

## The ODEs

Each round picks one of these and randomizes the parameters:

- Exponential: y' = ky
- Logistic: y' = ry(1 - y/K)
- Linear with forcing: y' = -ay + b
- Newton's law of cooling: y' = -k(y - T_env)

Three of these have analytical solutions which I used to verify the RK4 implementation is correct. Errors were all under 0.001 at step size h = 0.01.

## Notes

- I used MathJax to render the equations.
- No frameworks, no build step. Just plain HTML/CSS/JS.
