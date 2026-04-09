# Design System & Colors (DiploGO)

To create a gamification effect and retain user attention, DiploGO uses a modern color palette based on a dark theme with bright neon accents.

## Palette (Color scheme)

- **Primary Background (Dark)**: `#121212` — Main background of the application.
- **Secondary Background (Surface)**: `#1E1E1E` — Topic cards, containers, modal windows.
- **Accent Color (Neon Purple)**: `#BB86FC` — Main accent color for buttons, active states, icons.
- **Secondary Accent (Teal)**: `#03DAC6` — Color for displaying correct answers, successful actions, and streaks.
- **Error / Incorrect (Coral Red)**: `#CF6679` — Color for wrong answers and error messages.
- **Text Primary**: `#FFFFFF` — Headings, main text.
- **Text Secondary**: `#B3B3B3` — Tooltips, secondary text.

## UI Guidelines

### Buttons
- Buttons must have a border radius `borderRadius: 12`.
- Primary buttons use the `Accent Color` with dark text.
- A slight scale down effect upon pressing is mandatory (scale `0.95`).

### Progress Bar
- Smooth fill with the `Secondary Accent (Teal)` color.
- Fill animations are expected upon value change.

### Topic Cards
- Background: `#1E1E1E`.
- Shadow: slight dark shadow `0px 4px 10px rgba(0,0,0,0.5)`, so they "float" over the background.

### Typography
- It is recommended to use **Inter** or **Roboto** fonts for readability.
- Headings (H1/H2) should be bold (700) and expressive.

## Animations
- **Streak**: When unlocking a new streak level, an animation of a slight pulsation (of font/icon) and a color change should be played.
