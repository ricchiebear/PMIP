# PMIP UI/UX Design System

## 1. PMIP Visual Identity

PMIP should present itself as a modern, credible and premium music intelligence platform.

The visual identity should communicate:

- music and creativity
- data intelligence
- professionalism
- trust
- clarity
- modern technology
- global music discovery

PMIP should not look like a raw developer dashboard or a generic admin panel.

The intended design direction is:

```text
Dark navy foundation
        +
Purple intelligence accent
        +
Bright readable typography
        +
Clean data cards
        +
Music-focused imagery
        +
Clear analytical visualisation
```

The overall product should feel:

```text
modern
confident
intelligent
music-focused
premium
clean
data-driven
```

### Brand Personality

PMIP should feel like a platform that turns complex music data into understandable intelligence.

The brand personality can be summarised as:

```text
Creative enough for the music industry
Professional enough for analytical use
Clear enough for public users
Technical without feeling complicated
```

### Visual Direction

The primary visual environment should use a dark interface.

Dark backgrounds should be used for:

```text
main navigation
side navigation
hero sections
dashboard structure
intelligence areas
footer
```

Purple should act as the main PMIP identity colour and should be used for:

```text
primary actions
active navigation items
important intelligence
chart highlights
icons
focus states
selected controls
brand elements
```

White and light-grey text should provide strong readability against the dark interface.

Cards should remain visually separated using:

```text
subtle borders
slightly lighter dark surfaces
rounded corners
controlled shadows
consistent spacing
```

Music imagery should be used selectively in areas such as:

```text
dashboard hero sections
artist presentation
release presentation
promotional or discovery areas
```

The imagery should support the analytical content rather than overpower it.

---

## 2. PMIP Colour Direction

### Primary Brand Colours

```text
Primary Background
#0A0F1F

Secondary Background
#121827

Primary Accent Purple
#7C3AED

Accent / Hover Purple
#A855F7
```

### Text Colours

```text
Primary Text
#FFFFFF

Secondary Text
#9CA3AF

Muted Text
#6B7280
```

### Surface and Border Colours

```text
Dark Card Surface
#111827

Elevated Surface
#182133

Border
#334155
```

### Semantic Colours

```text
Success
#16A34A

Warning
#F59E0B

Error
#DC2626

Information
#3B82F6
```

---

## 3. Colour Usage Rules

### Primary Background

Use:

```text
#0A0F1F
```

for the main application background.

This should create the overall dark PMIP environment.

### Secondary Background

Use:

```text
#121827
```

for areas that need slight visual separation from the main background.

Examples:

```text
sidebars
navigation containers
secondary dashboard sections
```

### Primary Accent

Use:

```text
#7C3AED
```

for the main PMIP identity.

Examples:

```text
primary buttons
active navigation
selected controls
important metric highlights
chart lines
icons
links
```

Purple should remain an accent rather than covering large amounts of the interface.

### Hover Accent

Use:

```text
#A855F7
```

for:

```text
button hover states
interactive highlights
chart hover emphasis
selected states
```

### Text

Use:

```text
#FFFFFF
```

for important headings and primary values.

Use:

```text
#9CA3AF
```

for:

```text
supporting text
descriptions
labels
secondary information
```

### Semantic Colours

Semantic colours should only communicate meaning.

Use:

```text
Green
```

for positive or successful states.

Use:

```text
Amber
```

for warning or review-required states.

Use:

```text
Red
```

for errors, destructive actions or negative warnings.

Use:

```text
Blue
```

for neutral informational states.

These colours should not compete with PMIP purple as the main brand colour.

---

## 4. Visual Hierarchy

PMIP should use visual hierarchy to help users understand information quickly.

The hierarchy should normally follow:

```text
Page Title
        ↓
Short explanation
        ↓
Primary metrics
        ↓
Charts / intelligence
        ↓
Supporting explanation
        ↓
Detailed records
```

Important intelligence values should be visually stronger than their labels.

For example:

```text
Momentum Score
87.5
```

where:

```text
Momentum Score
```

is secondary text and:

```text
87.5
```

is large, bright and visually dominant.

---

## 5. Card Direction

Cards should use a consistent dark design.

Recommended card style:

```text
Background: #111827
Border: 1px solid #334155
Border radius: 12px
Subtle shadow
Comfortable internal spacing
```

Cards should avoid excessive decoration.

They should communicate:

```text
one clear purpose
one main metric or content group
supporting information underneath
```

---

## 6. Brand Accent Behaviour

Purple should act as the visual signal for PMIP intelligence.

Examples:

```text
active navigation
momentum scores
forecast emphasis
chart highlights
search actions
selected tabs
important links
```

This creates a consistent association:

```text
Purple = PMIP intelligence / interaction
```

---

## 7. Final Visual Identity Decision

The official PMIP visual identity will use:

```text
Dark navy interface
Purple intelligence accent
White primary typography
Grey supporting typography
Subtle dark cards
Semantic green / amber / red / blue states
Music-focused imagery
Clean analytical layouts
```

This direction should be used consistently across:

```text
Home
Artist Search
Artist Profiles
Track Pages
Release Pages
Intelligence Dashboard
Charts
Forms
Navigation
Loading States
Empty States
Error States
Mobile Layouts
Tablet Layouts
Desktop Layouts
```

The goal is to make PMIP feel like one coherent product rather than a collection of separate pages.

## 8. Typography and Heading Hierarchy

### Purpose

Typography should make PMIP easy to scan and understand.

Because the platform contains:

```text
data
charts
metrics
artist information
technical intelligence
supporting explanations
```

the text system needs to clearly separate:

```text
page titles
section headings
card headings
metric values
body text
helper text
labels
captions
```

The typography should feel modern and professional without becoming too heavy.

---

## 9. Primary Font

The recommended PMIP font family is:

```text
Inter
```

Inter is suitable because it is:

```text
clean
modern
highly readable
well suited to dashboards
clear at small sizes
strong for numerical data
```

The fallback stack should be:

```css
font-family:
  Inter,
  system-ui,
  -apple-system,
  BlinkMacSystemFont,
  "Segoe UI",
  sans-serif;
```

---

## 10. Heading Hierarchy

### H1 — Main Page Heading

Use H1 for the main title of a page.

Examples:

```text
Artist Intelligence
Track Performance
Release Performance
Music Intelligence
```

Recommended style:

```text
Font Size: 40px
Font Weight: 700
Line Height: 1.1
Colour: #FFFFFF
```

Usage rule:

```text
Only one main H1 should normally appear on each page.
```

---

### H2 — Major Section Heading

Use H2 for important sections within a page.

Examples:

```text
Momentum Intelligence
Streaming Performance
Geographic Intelligence
Market Growth
Release Performance
```

Recommended style:

```text
Font Size: 28px
Font Weight: 700
Line Height: 1.2
Colour: #FFFFFF
```

---

### H3 — Card or Subsection Heading

Use H3 for cards and smaller content sections.

Examples:

```text
Momentum Score
Predicted vs Actual Streams
Top Markets
Anomaly Summary
```

Recommended style:

```text
Font Size: 20px
Font Weight: 600
Line Height: 1.3
Colour: #FFFFFF
```

---

## 11. Body Text

### Primary Body Text

Use for:

```text
descriptions
explanations
paragraphs
public-facing intelligence summaries
```

Recommended style:

```text
Font Size: 16px
Font Weight: 400
Line Height: 1.6
Colour: #E5E7EB
```

The line height should be generous enough to make analytical explanations easy to read.

---

### Secondary Body Text

Use for:

```text
supporting descriptions
less important information
secondary metadata
```

Recommended style:

```text
Font Size: 15px
Font Weight: 400
Line Height: 1.5
Colour: #9CA3AF
```

---

## 12. Small and Helper Text

Use for:

```text
field help
captions
small metadata
chart notes
timestamps
supporting labels
```

Recommended style:

```text
Font Size: 14px
Font Weight: 400
Line Height: 1.4
Colour: #9CA3AF
```

Very small text should generally be avoided.

The minimum normal readable size should remain:

```text
14px
```

---

## 13. Form Labels

Form labels should remain clearly visible.

Examples:

```text
Artist ID
Track ID
Release ID
Search Artist
Country
```

Recommended style:

```text
Font Size: 14px
Font Weight: 600
Colour: #E5E7EB
```

Labels should appear above their associated input fields.

---

## 14. Metric Labels

Metric cards usually contain two text levels:

```text
Label
Value
```

Example:

```text
Momentum Score
87.5
```

Metric label:

```text
Font Size: 14px
Font Weight: 500
Colour: #9CA3AF
```

Metric value:

```text
Font Size: 32px
Font Weight: 700
Colour: #FFFFFF
```

Important metric values may use the PMIP purple accent when appropriate.

---

## 15. Large Dashboard Metrics

For high-priority dashboard statistics such as:

```text
1.2M Total Tracks
185K Artists
320K Releases
195 Countries
```

recommended value style:

```text
Font Size: 30–36px
Font Weight: 700
Colour: #FFFFFF
```

Supporting label:

```text
Font Size: 14px
Font Weight: 500
Colour: #9CA3AF
```

---

## 16. Navigation Typography

Navigation items should remain clear but less visually dominant than page headings.

Recommended style:

```text
Font Size: 15px
Font Weight: 500
Colour: #CBD5E1
```

Active navigation:

```text
Font Weight: 600
Colour: #FFFFFF
```

The active item should also use the purple visual treatment defined in the PMIP colour system.

---

## 17. Button Typography

Buttons should use:

```text
Font Size: 15px
Font Weight: 600
```

Primary buttons should be easy to identify without using oversized text.

Examples:

```text
Search
Load Forecast
View Artist
Explore Intelligence
Retry
```

---

## 18. Chart Typography

Chart text should remain readable but should not compete with the main content.

Axis labels:

```text
Font Size: 12–14px
Colour: #9CA3AF
```

Legend text:

```text
Font Size: 13–14px
Colour: #CBD5E1
```

Tooltip title:

```text
Font Size: 14px
Font Weight: 600
Colour: #FFFFFF
```

Tooltip supporting values:

```text
Font Size: 13px
Colour: #E5E7EB
```

---

## 19. Typography Usage Rules

The PMIP typography system should follow these rules:

```text
Do not use several unrelated font sizes on one page.

Do not use bold text for every piece of information.

Use large text only for important hierarchy or metrics.

Keep supporting text visually quieter than primary values.

Keep technical explanations readable and concise.

Use consistent heading levels across all pages.

Maintain readable line spacing.

Avoid all-caps paragraphs.
```

---

## 20. Recommended Typography Scale

The final typography scale should be:

```text
Display / Hero:       48–56px / 700
H1 Page Title:        40px / 700
H2 Section Heading:   28px / 700
H3 Card Heading:      20px / 600
Large Metric:         32–36px / 700
Body:                 16px / 400
Secondary Body:       15px / 400
Small / Helper:       14px / 400
Label:                14px / 600
Navigation:           15px / 500
Button:               15px / 600
Chart Text:           12–14px
```

---

## 21. Responsive Typography

Typography should reduce gradually on smaller screens.

### Desktop

```text
Hero: 56px
H1: 40px
H2: 28px
H3: 20px
Body: 16px
```

### Tablet

```text
Hero: 44px
H1: 34px
H2: 26px
H3: 20px
Body: 16px
```

### Mobile

```text
Hero: 36px
H1: 30px
H2: 24px
H3: 18px
Body: 16px
```

Body text should not become unnecessarily small on mobile devices.

---

## 22. Final Typography Decision

The official PMIP typography direction is:

```text
Font Family: Inter

Clear hierarchy
Strong page titles
Moderate section headings
Readable body text
Prominent analytical metrics
Subtle supporting text
Consistent chart labels
Responsive typography
```

This typography system should be reused across:

```text
navigation
home dashboard
artist search
artist profiles
track pages
release pages
intelligence sections
metric cards
charts
forms
loading states
empty states
error states
```

The goal is to ensure that users can immediately understand:

```text
what page they are on
what information is most important
what information is supporting context
what actions they can take
```

## 23. Spacing, Layout and Grid System

### Purpose

The spacing and layout system should make PMIP feel organised, balanced and easy to scan.

Because the platform contains:

```text
navigation
hero content
search controls
metric cards
charts
forms
tables
intelligence sections
artist information
release information
```

the spacing system needs to create clear separation without making the dashboard feel empty or crowded.

The goal is to make every page feel like part of the same product.

---

## 24. Core Spacing Scale

PMIP should use a consistent spacing scale based on:

```text
4px
8px
12px
16px
24px
32px
48px
64px
```

These values should be reused throughout the interface.

### Recommended Usage

```text
4px
Very small internal spacing

8px
Icon-to-text spacing
small label gaps

12px
Compact card spacing
small control groups

16px
Standard component spacing
form field spacing
button groups

24px
Card padding
section item spacing

32px
Large component separation
major content blocks

48px
Page section separation

64px
Large hero or major page spacing
```

The interface should avoid random spacing values unless there is a strong design reason.

---

## 25. Page Container

Main PMIP pages should use a consistent central content container.

Recommended desktop structure:

```text
Maximum Content Width: 1440px
Horizontal Page Padding: 32px
```

Large screens should not allow content to stretch endlessly across the display.

The basic layout should be:

```text
Browser Width
        ↓
Sidebar / Navigation
        ↓
Main Content Container
        ↓
Page Content
```

The main content should remain visually centred and controlled.

---

## 26. Desktop Layout

On desktop, PMIP should use the available width efficiently without creating excessive content density.

Recommended structure:

```text
Top Navigation
        ↓
Sidebar + Main Content

┌──────────────┬───────────────────────────────┐
│              │                               │
│   Sidebar    │         Main Content          │
│              │                               │
│              │                               │
└──────────────┴───────────────────────────────┘
```

Recommended sidebar width:

```text
220px–240px
```

The sidebar should remain visually stable across the main dashboard pages.

Main content should use:

```text
32px page padding
```

on larger desktop screens.

---

## 27. Dashboard Grid

Summary cards should use a responsive grid.

Recommended desktop layout:

```text
4 columns
```

Example:

```text
┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐
│   Tracks   │ │  Artists   │ │ Releases   │ │ Countries  │
└────────────┘ └────────────┘ └────────────┘ └────────────┘
```

Recommended gap:

```text
16px–24px
```

The cards should have equal visual weight and consistent height.

---

## 28. Two-Column Intelligence Layout

Some intelligence sections may work better in a two-column layout.

Example:

```text
┌────────────────────────┬────────────────────────┐
│                        │                        │
│     Main Chart         │     Summary / Context  │
│                        │                        │
└────────────────────────┴────────────────────────┘
```

Recommended ratio:

```text
2fr 1fr
```

or:

```text
1fr 1fr
```

depending on the content.

This can be useful for:

```text
forecasting
momentum
release performance
geographic summaries
market growth
```

---

## 29. Card Padding

Standard card padding should be:

```text
24px
```

Compact cards may use:

```text
16px
```

Large intelligence panels may use:

```text
24px–32px
```

Card content should not sit too close to the border.

---

## 30. Section Spacing

Major sections should use:

```text
48px
```

of vertical separation where appropriate.

Example:

```text
Page Heading

48px

Summary Metrics

48px

Main Intelligence Section

48px

Supporting Data
```

Smaller related sections may use:

```text
24px–32px
```

between them.

---

## 31. Heading Spacing

Recommended heading spacing:

### H1

```text
Bottom Margin: 12px–16px
```

### H2

```text
Top Margin: 32px–48px
Bottom Margin: 16px–24px
```

### H3

```text
Bottom Margin: 12px–16px
```

Headings should remain visually connected to the content they describe.

---

## 32. Form Layout

Form controls should use consistent vertical spacing.

Recommended pattern:

```text
Label
8px
Input
16px–24px
Next Field
```

Example:

```text
Artist ID
[ Input Field ]

Track ID
[ Input Field ]

[ Load Intelligence ]
```

Button groups should use:

```text
12px–16px
```

between controls.

---

## 33. Search Layout

The primary dashboard search should be visually prominent.

Recommended structure:

```text
Search Input
+
Primary Search Button
```

Desktop:

```text
┌─────────────────────────────────────┬────────────┐
│ Search artist, track or release...  │   Search   │
└─────────────────────────────────────┴────────────┘
```

The search field should take most of the available width.

Recommended ratio:

```text
4fr 1fr
```

On mobile, the search input and button should stack.

---

## 34. Chart Spacing

Charts need breathing space around:

```text
titles
legends
axis labels
tooltips
supporting explanations
```

A chart container should usually use:

```text
24px padding
```

Recommended structure:

```text
Chart Title
8px
Short Explanation
24px
Chart
16px
Legend / Supporting Note
```

Charts should not touch card borders.

---

## 35. Data Table Spacing

Tables should use comfortable row spacing.

Recommended row height:

```text
48px–56px
```

Table headers should have:

```text
12px–16px
```

vertical padding.

Table cells should use:

```text
16px
```

horizontal padding.

Dense tables should still remain readable.

---

## 36. Mobile Layout

On mobile devices, the interface should become primarily single-column.

Recommended structure:

```text
Top Navigation
        ↓
Page Heading
        ↓
Search
        ↓
Metric Cards
        ↓
Charts
        ↓
Intelligence Sections
```

Main page padding:

```text
16px
```

Cards:

```text
1 column
```

Major section spacing:

```text
32px
```

The sidebar should not remain permanently visible on small screens.

It should become:

```text
drawer
menu
or collapsible navigation
```

---

## 37. Tablet Layout

Tablet and iPad layouts should use:

```text
20px–24px
```

page padding.

Metric cards should generally use:

```text
2 columns
```

Example:

```text
┌───────────────┐ ┌───────────────┐
│    Tracks     │ │    Artists    │
└───────────────┘ └───────────────┘

┌───────────────┐ ┌───────────────┐
│   Releases    │ │   Countries   │
└───────────────┘ └───────────────┘
```

Large charts may remain full width.

Two-column intelligence layouts should collapse when content becomes too narrow.

---

## 38. Responsive Grid Behaviour

Recommended grid behaviour:

```text
Desktop
4-column summary grid

Tablet
2-column summary grid

Mobile
1-column summary grid
```

For content sections:

```text
Desktop
2 columns where useful

Tablet
1–2 columns depending on width

Mobile
1 column
```

The layout should adapt naturally instead of shrinking cards until they become difficult to read.

---

## 39. Maximum Content Width

Long text and analytical explanations should not span the full desktop width.

Recommended readable text width:

```text
650px–800px
```

This is especially useful for:

```text
intelligence explanations
documentation-style content
help text
public-facing analytical summaries
```

Charts and tables may use more width where required.

---

## 40. Alignment Rules

PMIP should use consistent alignment.

Default:

```text
Left aligned
```

for:

```text
headings
body text
labels
forms
cards
tables
```

Numerical values inside tables may use:

```text
right alignment
```

when it improves comparison.

Centered text should mainly be used for:

```text
empty states
loading states
simple status panels
```

---

## 41. Layout Consistency Rules

The PMIP layout should follow these rules:

```text
Use the same page container across major pages.

Use the same card padding across similar components.

Use consistent gaps between cards.

Keep page headings in the same position.

Avoid placing related information too far apart.

Do not overcrowd charts with nearby controls.

Use whitespace to group related information.

Avoid excessive empty space on desktop.

Stack complex layouts cleanly on mobile.
```

---

## 42. Recommended Layout Tokens

The final layout system can be summarised as:

```text
xs: 4px
sm: 8px
md: 16px
lg: 24px
xl: 32px
2xl: 48px
3xl: 64px
```

Recommended component values:

```text
Page Padding Desktop: 32px
Page Padding Tablet: 24px
Page Padding Mobile: 16px

Card Padding: 24px

Card Gap: 16px–24px

Section Gap: 48px

Sidebar Width: 220px–240px

Maximum Content Width: 1440px

Border Radius: 12px
```

---

## 43. Final Spacing and Layout Decision

The official PMIP layout direction will use:

```text
consistent spacing tokens
controlled page widths
responsive grid layouts
comfortable card padding
clear section separation
stable desktop navigation
simplified mobile navigation
single-column mobile content
balanced tablet layouts
```

The goal is for every page to feel:

```text
structured
predictable
comfortable
easy to scan
responsive
consistent
```

rather than having each page use a different layout pattern.

## 44. Reusable Component Styles

### Purpose

Reusable component styles ensure that the same type of interface element looks and behaves consistently across PMIP.

This includes:

```text
buttons
inputs
search fields
dropdowns
cards
metric cards
badges
loading states
empty states
error states
validation messages
```

The goal is to make the interface feel predictable.

If two buttons perform similar actions, they should look related.

If two cards present similar information, they should follow the same structure.

This reduces visual confusion and makes PMIP easier to use.

---

## 45. Primary Buttons

Primary buttons should represent the most important action in a section.

Examples:

```text
Search
Load Forecast
View Intelligence
Explore Artist
Retry
```

Recommended style:

```text
Background: #7C3AED
Text: #FFFFFF
Font Size: 15px
Font Weight: 600
Border: none
Border Radius: 10px
Padding: 12px 18px
Minimum Height: 44px
```

Hover:

```text
Background: #A855F7
```

Focus:

```text
Visible purple focus ring
```

Disabled:

```text
Reduced opacity
No hover effect
Cursor should indicate disabled state
```

Primary buttons should not be overused.

Each section should normally have one clear primary action.

---

## 46. Secondary Buttons

Secondary buttons should be used for less important actions.

Examples:

```text
Cancel
Back
Reset
View Details
Clear Filters
```

Recommended style:

```text
Background: transparent
Text: #E5E7EB
Border: 1px solid #334155
Border Radius: 10px
Padding: 12px 18px
Minimum Height: 44px
```

Hover:

```text
Background: #182133
Border Colour: #475569
```

---

## 47. Destructive Buttons

Destructive buttons should only be used for actions that remove, delete or permanently change something.

Recommended style:

```text
Background: #DC2626
Text: #FFFFFF
```

Hover:

```text
Slightly brighter or darker red
```

Destructive styling should not be used for normal errors or warnings.

---

## 48. Input Fields

Inputs should be simple, readable and easy to identify.

Recommended style:

```text
Background: #111827
Text: #FFFFFF
Border: 1px solid #334155
Border Radius: 10px
Padding: 12px 14px
Minimum Height: 44px
Font Size: 15px
```

Placeholder text:

```text
Colour: #6B7280
```

Focus state:

```text
Border Colour: #7C3AED
Visible focus ring
```

Invalid state:

```text
Border Colour: #DC2626
```

Inputs should never rely only on placeholder text as a label.

---

## 49. Search Fields

Search controls should visually communicate that they are a major discovery tool in PMIP.

Recommended desktop structure:

```text
[ Search input                         ] [ Search ]
```

Recommended search input behaviour:

```text
clear placeholder
search icon where appropriate
visible focus state
clear button when text is present
```

Example placeholder:

```text
Search artist, track or release
```

Search fields should be wider than their action button.

---

## 50. Dropdowns and Select Controls

Dropdowns should use the same visual language as text inputs.

Recommended style:

```text
Background: #111827
Text: #FFFFFF
Border: 1px solid #334155
Border Radius: 10px
Minimum Height: 44px
Padding: 12px 14px
```

Dropdown options should use clear public-facing names.

For example:

```text
United Kingdom
```

instead of:

```text
GB
```

where human-readable values are available.

---

## 51. Standard Content Cards

Cards should visually group related information.

Recommended structure:

```text
Card Title
Supporting Text
Main Content
Optional Action
```

Recommended style:

```text
Background: #111827
Border: 1px solid #334155
Border Radius: 12px
Padding: 24px
```

Cards should avoid unnecessary decoration.

The content should remain the main focus.

---

## 52. Metric Cards

Metric cards should present one primary number or analytical value.

Example:

```text
Momentum Score
87.5
Very High Momentum
```

Recommended structure:

```text
Small Label
Large Value
Optional Supporting Context
```

Recommended style:

```text
Background: #111827
Border: 1px solid #334155
Border Radius: 12px
Padding: 20px–24px
```

Metric label:

```text
14px
#9CA3AF
```

Metric value:

```text
32px–36px
700 weight
#FFFFFF
```

Important intelligence values may use:

```text
#7C3AED
```

when appropriate.

---

## 53. Status Badges

Badges should communicate short status information.

Examples:

```text
High Momentum
Review Required
Positive
Extreme
Available
Unavailable
```

Recommended badge style:

```text
Font Size: 12px–13px
Font Weight: 600
Padding: 5px 9px
Border Radius: 999px
```

This gives badges a pill-style appearance.

---

## 54. Success Badges

Use success styling for positive or successfully completed states.

Recommended colours:

```text
Background: rgba(22, 163, 74, 0.15)
Text: #4ADE80
```

Examples:

```text
Available
Completed
Positive
```

Success styling should only be used where the meaning is genuinely positive.

---

## 55. Warning Badges

Use warning styling for:

```text
review required
attention needed
moderate concern
```

Recommended colours:

```text
Background: rgba(245, 158, 11, 0.15)
Text: #FBBF24
```

---

## 56. Error or Critical Badges

Use critical styling for:

```text
extreme anomaly
failed state
high-risk warning
```

Recommended colours:

```text
Background: rgba(220, 38, 38, 0.15)
Text: #F87171
```

Red should be used carefully so it keeps its meaning.

---

## 57. Information Badges

Use informational styling for neutral context.

Recommended colours:

```text
Background: rgba(59, 130, 246, 0.15)
Text: #60A5FA
```

Examples:

```text
Informational
Historical Data
Model Output
```

---

## 58. Neutral Badges

Neutral badges should be used for states that are neither positive nor negative.

Examples:

```text
Not Available
No Review Flag
No Data
```

Recommended colours:

```text
Background: #182133
Text: #CBD5E1
Border: 1px solid #334155
```

---

## 59. Loading States

Loading states should clearly communicate that data is being retrieved.

The preferred PMIP loading behaviour should use:

```text
skeleton cards
subtle spinner
short loading message
```

Example:

```text
Loading artist intelligence...
```

Loading components should use the same size and layout as the content that will eventually replace them where possible.

This reduces layout movement.

---

## 60. Skeleton Loading Style

Skeleton surfaces should use:

```text
Base: #182133
Highlight: #243044
```

Skeleton shapes should resemble:

```text
text rows
metric values
cards
chart containers
```

The animation should remain subtle.

It should not distract from the interface.

---

## 61. Empty States

Empty states should explain that the request worked but there is currently nothing to display.

An empty state should contain:

```text
clear title
short explanation
optional next action
```

Example:

```text
No market movement data available

The latest intelligence run did not identify any market movement records.
```

Optional action:

```text
Explore other intelligence
```

Empty states should not use error styling.

---

## 62. Empty-State Visual Style

Recommended presentation:

```text
Centered inside content card
Simple icon
Muted text
Comfortable vertical spacing
```

Recommended colours:

```text
Icon: #6B7280
Heading: #E5E7EB
Description: #9CA3AF
```

---

## 63. Error States

Error states should communicate that something failed.

Examples:

```text
API request failed
backend unavailable
database connection issue
unexpected server error
```

Recommended structure:

```text
Error Title
Short Explanation
Retry Action
```

Example:

```text
Unable to load forecasting intelligence

PMIP could not retrieve the latest forecast data.

[ Retry ]
```

---

## 64. Error-State Visual Style

Recommended colours:

```text
Border: rgba(220, 38, 38, 0.5)
Background: rgba(220, 38, 38, 0.08)
Icon: #F87171
Heading: #FFFFFF
Description: #FCA5A5
```

The message should explain what happened without showing unnecessary technical details.

---

## 65. Validation Messages

Validation messages should appear close to the field causing the issue.

Example:

```text
Track ID

[              ]

Please enter a valid track ID.
```

Recommended style:

```text
Font Size: 13px–14px
Colour: #F87171
Margin Top: 6px
```

Validation language should be helpful rather than technical.

Prefer:

```text
Please enter a valid artist ID.
```

instead of:

```text
Invalid parameter.
```

---

## 66. Information Messages

Some messages are informational rather than errors.

Examples:

```text
This intelligence is based on the latest available analytical run.

No review flag was generated for this forecast.
```

Recommended style:

```text
Background: rgba(59, 130, 246, 0.08)
Border: 1px solid rgba(59, 130, 246, 0.3)
Text: #BFDBFE
Border Radius: 10px
Padding: 12px–16px
```

---

## 67. Tooltips

Tooltips should explain technical terms without overcrowding the interface.

Useful examples include:

```text
Momentum Score
Anomaly Score
Forecast Error
Growth Score
Review Flag
```

Tooltip content should be:

```text
short
plain English
contextual
```

Example:

```text
Momentum Score

A combined measure of how strongly an artist's recent performance is growing.
```

Tooltips should not contain long paragraphs.

---

## 68. Chart Containers

Charts should appear inside dedicated card-style containers.

Recommended structure:

```text
Chart Title
Short Explanation
Legend
Chart
Optional Supporting Note
```

Recommended style:

```text
Background: #111827
Border: 1px solid #334155
Border Radius: 12px
Padding: 24px
```

Chart containers should maintain consistent height where similar charts appear together.

---

## 69. Chart Tooltips

Chart tooltips should use the PMIP dark theme.

Recommended style:

```text
Background: #0F172A
Border: 1px solid #334155
Border Radius: 8px
Padding: 10px–12px
```

Tooltip values should clearly identify:

```text
metric name
value
date or category
```

where relevant.

---

## 70. Interactive Card Behaviour

Cards that can be clicked should make that interaction obvious.

Interactive cards may use:

```text
slight border change
subtle lift
purple highlight
pointer cursor
```

Hover behaviour should remain restrained.

The interface should not have every card moving unnecessarily.

---

## 71. Non-Interactive Card Behaviour

Cards that are not clickable should not imitate buttons.

They should avoid:

```text
strong hover effects
pointer cursors
button-like borders
```

This prevents users from expecting an interaction that does not exist.

---

## 72. Component Consistency Rules

Reusable PMIP components should follow these rules:

```text
Similar actions use similar buttons.

Similar cards use the same padding and border radius.

Inputs use the same height.

All focus states remain visible.

Status colours retain the same meaning.

Empty states are visually different from errors.

Loading states do not look like failures.

Validation messages explain what the user should fix.

Public-facing language should be clear and non-technical.
```

---

## 73. Component State System

Interactive components should support the following states where relevant:

```text
default
hover
focus
active
disabled
loading
error
success
```

These states should be designed consistently rather than added separately for each page.

---

## 74. Final Reusable Component Direction

The official PMIP reusable component system should use:

```text
Purple primary buttons
Dark secondary buttons
Dark form controls
12px rounded cards
Clear metric cards
Semantic status badges
Skeleton loading states
Friendly empty states
Clear error states
Helpful validation messages
Readable tooltips
Consistent chart containers
Visible accessibility focus states
```

These components should become the foundation for:

```text
Home Dashboard
Artist Search
Artist Profiles
Track Performance
Release Performance
Intelligence Dashboard
Forms
Charts
Navigation
Responsive Layouts
```

The goal is for PMIP users to recognise interface patterns immediately, regardless of which page they are using.

## 75. Navigation and Global Application Shell

### Purpose

The global application shell defines the structure that appears consistently across PMIP.

This includes:

```text
top navigation
sidebar navigation
page headers
main content area
mobile navigation
footer
```

The goal is to make PMIP feel like one connected product.

Users should always understand:

```text
where they are
what section they are viewing
how to move to another section
where the main content begins
```

---

## 76. Desktop Application Shell

The recommended desktop structure is:

```text
┌───────────────────────────────────────────────────────────────┐
│                         Top Navigation                        │
├───────────────┬───────────────────────────────────────────────┤
│               │                                               │
│   Sidebar     │                 Main Content                  │
│               │                                               │
│               │                                               │
│               │                                               │
└───────────────┴───────────────────────────────────────────────┘
```

The top navigation should contain:

```text
PMIP branding
global search
quick actions
profile / utility controls if required later
```

The sidebar should contain the main navigation structure.

---

## 77. PMIP Brand Area

The PMIP brand should appear clearly at the top-left of the application.

Recommended structure:

```text
PMIP logo / symbol

PMIP
Public Music Intelligence Platform
```

The full subtitle does not need to appear everywhere.

On compact layouts, the brand may simply display:

```text
PMIP
```

The logo area should remain visually consistent across desktop and mobile navigation.

---

## 78. Sidebar Navigation

The sidebar should provide clear access to the main areas of the platform.

Recommended navigation structure:

```text
Dashboard
Artists
Tracks
Releases
Intelligence
```

Optional future sections may include:

```text
Markets
Discover
Reports
About PMIP
```

Only sections that currently exist should be shown.

Navigation should not advertise unavailable functionality.

---

## 79. Sidebar Item Style

Default navigation item:

```text
Text Colour: #CBD5E1
Font Size: 15px
Font Weight: 500
Border Radius: 8px
Padding: 10px 12px
```

Each item may include:

```text
icon
label
```

Example:

```text
⌂ Dashboard
♫ Artists
▤ Tracks
◉ Releases
✦ Intelligence
```

Icons should remain simple and visually consistent.

---

## 80. Active Navigation State

The currently selected page should be immediately obvious.

Recommended active style:

```text
Background: rgba(124, 58, 237, 0.15)
Text: #FFFFFF
Icon: #A855F7
```

A small purple indicator may also appear on the side of the active item.

Example:

```text
│ ✦ Intelligence
```

The active state should not rely only on text colour.

---

## 81. Sidebar Hover State

Hover state:

```text
Background: #182133
Text: #FFFFFF
```

The transition should remain subtle.

Recommended animation:

```text
150ms–200ms
```

The sidebar should not contain excessive motion.

---

## 82. Sidebar Width

Recommended desktop width:

```text
230px
```

Acceptable range:

```text
220px–240px
```

The width should remain stable across pages.

The sidebar should not change size depending on the content being viewed.

---

## 83. Sidebar Grouping

If the number of navigation items grows later, navigation should be grouped.

Example:

```text
MAIN
Dashboard
Artists
Tracks
Releases

INTELLIGENCE
Overview
Momentum
Forecasting
Anomalies
Markets
Geographic
```

For the current PMIP version, unnecessary grouping should be avoided if the navigation remains small.

---

## 84. Top Navigation

The top navigation should provide global actions rather than duplicate the sidebar.

Recommended contents:

```text
PMIP branding or compact logo
global search
optional utility actions
```

The top navigation should have a consistent height.

Recommended height:

```text
64px–72px
```

Recommended background:

```text
#0A0F1F
```

Bottom border:

```text
1px solid #1E293B
```

---

## 85. Global Search

Where appropriate, the top navigation may contain a global search field.

Example:

```text
[ Search artists, tracks or releases... ]
```

The global search should not replace page-specific search functionality where more detailed controls are needed.

Its purpose is quick discovery.

---

## 86. Page Header Structure

Every major page should begin with a predictable page header.

Recommended structure:

```text
Page Title

Short supporting description

Optional primary action
```

Example:

```text
Artist Intelligence

Explore artist momentum, growth, geographic and anomaly intelligence.

[ Search Artist ]
```

The page header should normally appear before:

```text
filters
summary cards
charts
tables
```

---

## 87. Breadcrumbs

Breadcrumbs are optional for the current PMIP version.

They may be useful for deeper pages such as:

```text
Artists
    ↓
Artist Profile
    ↓
Specific Intelligence Detail
```

Example:

```text
Artists / Bryan Martin
```

Breadcrumbs should not be added to simple top-level pages where they provide no value.

---

## 88. Main Content Area

The main content area should follow the previously defined layout system.

Recommended:

```text
Maximum Width: 1440px
Desktop Padding: 32px
Tablet Padding: 24px
Mobile Padding: 16px
```

The content area should not begin directly against the sidebar.

Clear visual separation should exist between:

```text
navigation
page header
main content
```

---

## 89. Dashboard Page Structure

The dashboard should follow a consistent order.

Recommended:

```text
Page Header
        ↓
Primary Search
        ↓
Summary Metrics
        ↓
Featured Intelligence
        ↓
Recent / Important Insights
        ↓
Supporting Sections
```

This gives users a clear starting point when they enter PMIP.

---

## 90. Artist Page Structure

Recommended artist page structure:

```text
Artist Identity
        ↓
Artist Summary
        ↓
Primary Metrics
        ↓
Streaming Performance
        ↓
Momentum Intelligence
        ↓
Growth Intelligence
        ↓
Geographic Intelligence
        ↓
Anomaly Intelligence
```

Only available intelligence should be shown.

Missing intelligence should use the empty or unavailable patterns already defined.

---

## 91. Track Page Structure

Recommended track page structure:

```text
Track Identity
        ↓
Track Metadata
        ↓
Streaming Performance
        ↓
Chart Performance
        ↓
Forecast Intelligence
        ↓
Anomaly Intelligence
        ↓
Geographic / Market Intelligence
```

The page should prioritise understandable performance information before deeper analytical details.

---

## 92. Release Page Structure

Recommended release page structure:

```text
Release Identity
        ↓
Release Metadata
        ↓
Track List
        ↓
Release Performance Summary
        ↓
Track-Level Performance Intelligence
        ↓
Charts / Supporting Context
```

Multi-track releases should remain easy to understand.

---

## 93. Intelligence Dashboard Structure

The intelligence dashboard should avoid appearing as one long technical page.

Recommended high-level structure:

```text
Intelligence Overview
        ↓
Momentum
        ↓
Forecasting
        ↓
Anomalies
        ↓
Geographic Intelligence
        ↓
Market Growth
```

Each section should contain:

```text
clear heading
short public-facing explanation
input / filter controls
results
chart or summary
supporting explanation
```

The same structure should be reused across intelligence sections where possible.

---

## 94. Navigation Labels

Navigation wording should remain public-facing and simple.

Prefer:

```text
Artists
Tracks
Releases
Intelligence
```

Avoid navigation labels such as:

```text
Artist Entity Lookup
Forecast Result Explorer
Analytical Component Output
```

Technical language should remain inside documentation rather than the public navigation.

---

## 95. Mobile Navigation

On mobile, the desktop sidebar should be replaced with a collapsible navigation drawer.

Recommended structure:

```text
┌─────────────────────────────┐
│ PMIP                   ☰    │
└─────────────────────────────┘
```

When the menu is opened:

```text
PMIP

Dashboard
Artists
Tracks
Releases
Intelligence
```

The drawer should close when:

```text
a navigation item is selected
the close button is pressed
the user taps outside the drawer
```

---

## 96. Mobile Navigation Button

The mobile menu button should:

```text
be at least 44px × 44px
have an accessible label
show a visible focus state
```

Example accessible label:

```text
Open navigation menu
```

The button should not rely only on a tiny icon.

---

## 97. Tablet Navigation

Tablet navigation can use either:

```text
compact sidebar
```

or:

```text
mobile-style navigation drawer
```

depending on available screen width.

A breakpoint-based approach should be used rather than assuming all tablets have the same layout.

---

## 98. Sticky Navigation

The top navigation may remain sticky when scrolling.

Recommended:

```text
position: sticky
top: 0
```

This can make navigation easier on long intelligence pages.

If used, the top navigation should maintain:

```text
solid background
visible border
appropriate z-index
```

so content does not visually overlap it.

---

## 99. Footer

The PMIP footer should be simple.

Recommended content:

```text
PMIP

Music Data. Deeper Insights.

About
Methodology
Data Sources
Privacy
```

Only links that actually exist should be included.

Recommended visual style:

```text
Dark background
Muted text
Small typography
Clear top border
```

The footer should not compete with the dashboard content.

---

## 100. Navigation Accessibility

Navigation should support:

```text
keyboard navigation
visible focus states
meaningful link labels
sufficient colour contrast
accessible menu controls
```

The user should be able to move through the navigation using:

```text
Tab
Shift + Tab
Enter
```

without requiring a mouse.

---

## 101. Page Transition Behaviour

PMIP should avoid heavy page transition effects.

Recommended behaviour:

```text
immediate route change
subtle content loading
preserve navigation structure
```

If loading is required, use the loading states already defined rather than full-screen animations.

---

## 102. Global Shell Consistency Rules

The global shell should follow these rules:

```text
Navigation stays in the same position across pages.

Active navigation is always obvious.

Page headers follow the same structure.

Main content uses consistent padding.

Sidebar width remains stable.

Mobile navigation is easy to open and close.

Page content should never hide underneath navigation.

Navigation wording remains simple.

The public interface should avoid development terminology.
```

---

## 103. Final Navigation Direction

The official PMIP global shell should use:

```text
Dark top navigation
Dark left sidebar on desktop
Purple active navigation
Stable main content area
Consistent page headers
Collapsible mobile navigation
Simple footer
Accessible keyboard interactions
```

The preferred desktop structure is:

```text
Top Navigation
        ↓
Sidebar + Main Content
```

The preferred mobile structure is:

```text
Compact Header
        ↓
Collapsible Menu
        ↓
Single-Column Main Content
```

This navigation system should provide the structural foundation for every major PMIP page.

## 104. Final PMIP Navigation Structure

The current PMIP frontend already contains the following main routes:

```text
Home
Artists
Tracks
Releases
Countries
Intelligence
```

These routes should form the official primary navigation for the current version of PMIP.

The navigation should therefore use:

```text
Home
Artists
Tracks
Releases
Countries
Intelligence
```

No additional navigation items should be introduced unless the related functionality actually exists.

Examples such as:

```text
Playlists
Reports
Developers
Resources
Settings
```

may appear in visual references, but should not be added to PMIP unless those sections are implemented later.

---

## 105. Desktop Navigation Structure

The desktop application should use a combination of:

```text
top navigation
+
left sidebar
```

The main navigation items should appear in the sidebar.

Recommended structure:

```text
PMIP

Home
Artists
Tracks
Releases
Countries
Intelligence
```

The sidebar should provide the main movement between PMIP sections.

The top navigation should be reserved for:

```text
PMIP branding
global search
future utility controls
```

This avoids duplicating the full navigation in two places.

---

## 106. Sidebar Order

The recommended sidebar order is:

```text
Home
Artists
Tracks
Releases
Countries
Intelligence
```

This order follows a simple progression:

```text
general overview
        ↓
core music entities
        ↓
geographic exploration
        ↓
advanced intelligence
```

The ordering should remain stable across desktop pages.

---

## 107. Active Route Behaviour

PMIP already uses:

```text
NavLink
```

from React Router.

This should continue to be used because it allows the interface to identify the active route.

The active navigation item should use:

```text
purple background
white text
purple or white icon
```

Recommended active styling:

```text
Background:
rgba(124, 58, 237, 0.18)

Text:
#FFFFFF

Accent:
#A855F7
```

This creates a strong visual indication of the current page.

---

## 108. Home Navigation

The root route:

```text
/
```

should represent:

```text
Home
```

The Home page should act as the main PMIP dashboard and discovery entry point.

The Home navigation item should therefore remain the first item in the sidebar.

---

## 109. Artists Navigation

The route:

```text
/artists
```

should be labelled:

```text
Artists
```

This section should provide artist discovery and access to artist profiles.

Individual artist pages such as:

```text
/artists/:artistId
```

should still keep:

```text
Artists
```

visually active in the navigation.

This maintains context while the user is viewing an individual artist.

---

## 110. Tracks Navigation

The route:

```text
/tracks
```

should be labelled:

```text
Tracks
```

This section should provide access to track-level performance and related information.

Any future deeper track route should keep:

```text
Tracks
```

active.

---

## 111. Releases Navigation

The route:

```text
/releases
```

should be labelled:

```text
Releases
```

This section should provide release discovery and release-performance intelligence.

If individual release routes are introduced later, the Releases item should remain active while viewing them.

---

## 112. Countries Navigation

The route:

```text
/countries
```

should remain visible as:

```text
Countries
```

because PMIP already includes geographic intelligence.

This label is clearer for public users than more technical alternatives such as:

```text
Geographic Intelligence
Country Analytics
Market Geography
```

The detailed geographic intelligence can remain inside the page itself.

---

## 113. Intelligence Navigation

The route:

```text
/intelligence
```

should be labelled:

```text
Intelligence
```

This section represents PMIP's advanced analytical capabilities.

It may contain areas such as:

```text
Momentum
Forecasting
Anomalies
Geographic Intelligence
Market Growth
```

The navigation label should remain short.

The technical intelligence types should appear inside the page rather than in the primary sidebar.

---

## 114. Recommended Navigation Icons

Each sidebar item may use a simple icon.

Recommended visual meanings:

```text
Home
Home / dashboard icon

Artists
People / artist icon

Tracks
Music note icon

Releases
Album / disc icon

Countries
Globe icon

Intelligence
Analytics / waveform icon
```

Icons should:

```text
use one consistent icon style
have similar stroke weight
remain visually secondary to labels
```

The interface should not mix unrelated icon styles.

---

## 115. Navigation Icon Colour

Default icon colour:

```text
#94A3B8
```

Active icon colour:

```text
#A855F7
```

Hover icon colour:

```text
#FFFFFF
```

Icons should help recognition but should never be the only indication of destination.

Text labels must remain visible.

---

## 116. Desktop Sidebar Final Design

Recommended sidebar design:

```text
Background:
#0A0F1F

Width:
230px

Border Right:
1px solid #1E293B

Padding:
16px

Navigation Gap:
6px–8px
```

Each navigation item:

```text
Minimum Height:
44px

Border Radius:
8px

Horizontal Padding:
12px
```

The sidebar should remain visually consistent throughout the application.

---

## 117. Top Navigation Final Design

The top navigation should use:

```text
Height:
68px

Background:
#0A0F1F

Border Bottom:
1px solid #1E293B
```

Recommended content:

```text
PMIP brand
global search
optional future utility controls
```

The global search may be introduced during the Home/dashboard redesign if needed.

The top navigation should not duplicate every sidebar link.

---

## 118. PMIP Brand Presentation

The brand area should use:

```text
PMIP
Public Music Intelligence Platform
```

on large screens.

Recommended structure:

```text
[ PMIP Icon ] PMIP
              Public Music Intelligence Platform
```

The subtitle should use smaller muted text.

Recommended:

```text
PMIP
Font Size: 20px–22px
Font Weight: 700

Subtitle
Font Size: 11px–12px
Colour: #94A3B8
```

On smaller screens, the subtitle may be hidden to save space.

---

## 119. Main Content Offset

On desktop, the main application content must account for the sidebar.

Conceptually:

```text
230px Sidebar
        +
Remaining Main Content
```

The content should not appear underneath the sidebar.

The main content area should still use the standard page padding defined earlier.

Recommended:

```text
Desktop:
32px

Tablet:
24px

Mobile:
16px
```

---

## 120. Mobile Navigation Final Design

On mobile, the sidebar should not remain permanently visible.

The interface should use:

```text
PMIP logo
+
menu button
```

Example:

```text
┌───────────────────────────────┐
│ PMIP                      ☰   │
└───────────────────────────────┘
```

Selecting the menu button should open a navigation drawer containing:

```text
Home
Artists
Tracks
Releases
Countries
Intelligence
```

The drawer should cover only the necessary part of the screen.

---

## 121. Mobile Drawer Behaviour

The mobile navigation drawer should close when:

```text
the user selects a route
the user presses the close button
the user clicks outside the drawer
```

The background behind the drawer should use a dark overlay.

Example:

```text
rgba(0, 0, 0, 0.55)
```

This keeps focus on the navigation.

---

## 122. Mobile Navigation Accessibility

The menu button should have:

```text
minimum size:
44px × 44px
```

Accessible label:

```text
Open navigation menu
```

The close button should use:

```text
Close navigation menu
```

Keyboard users should be able to navigate the drawer normally.

---

## 123. Tablet Navigation Behaviour

For tablets and iPads, PMIP may use:

```text
compact sidebar
```

on larger tablet widths.

On narrower tablets, it should switch to:

```text
mobile drawer navigation
```

This decision should be based on layout width rather than device type.

---

## 124. Navigation Breakpoint Direction

Recommended behaviour:

```text
Desktop:
Sidebar visible

Large Tablet:
Sidebar may remain visible or become compact

Small Tablet / Mobile:
Sidebar hidden
Menu button visible
```

The exact breakpoint can be adjusted during implementation after visual testing.

---

## 125. Global Page Header Pattern

Every major PMIP page should use the same general header structure.

Recommended:

```text
Page Title

Short Supporting Description
```

Optional:

```text
Primary Action
```

Example:

```text
Artists

Discover artists and explore their performance and intelligence.
```

This creates consistency across:

```text
Artists
Tracks
Releases
Countries
Intelligence
```

---

## 126. Global Footer Direction

The PMIP footer should remain minimal.

Recommended content:

```text
PMIP
Public Music Intelligence Platform

Music Data. Deeper Insights.
```

Optional links may include:

```text
About
Methodology
Data Sources
Privacy
```

Only links backed by real pages should be shown.

---

## 127. Official Global Shell

The official PMIP application shell should therefore use:

```text
Desktop

Top Navigation
        ↓
Left Sidebar + Main Content
        ↓
Footer
```

and:

```text
Mobile

Compact Header
        ↓
Navigation Drawer
        ↓
Single-Column Main Content
        ↓
Footer
```

The visual direction should remain consistent with the approved PMIP reference:

```text
dark navy shell
purple active states
white primary text
grey supporting text
subtle borders
clear page hierarchy
```

---

## 128. Task 1.5 Final Decision

The final navigation structure for the current PMIP frontend is:

```text
Home
Artists
Tracks
Releases
Countries
Intelligence
```

The current React Router routes should remain unchanged.

The redesign should improve:

```text
presentation
navigation clarity
responsive behaviour
active states
accessibility
brand identity
```

without changing the underlying route structure.


```

The PMIP design-system definition phase is now complete and ready for implementation.