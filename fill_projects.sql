-- 1. Norma
UPDATE projects 
SET 
  roles = ARRAY['Product Designer'],
  industries = 'Mobile App, Web App, Marketing Website',
  date = '2022–2023',
  content_blocks = '[
    {"id": "p1", "type": "text", "value": "Norma is a banking platform for freelancers and small businesses, combining account management with built-in bookkeeping features including invoicing, payments, and expense tracking in one place. There were no established local references to draw from, so the benchmark process was built around international fintech products, banking interfaces, and expense tools."},
    {"id": "p2", "type": "text", "value": "The Figma structure was organized into three separate documents: a style guide, a sprint file, and a handoff file. The style guide was published as a shared library feeding into both. This separation was a deliberate decision. Changes made during active sprints wouldn''t accidentally propagate to the handoff, which served as the stable, development-ready reference."},
    {"id": "p3", "type": "text", "value": "Mobile was scoped for quick, repeated actions. Web supported deeper financial management and reporting."},
    {"id": "p4", "type": "text", "value": "The marketing site established the product''s visual tone and translated complex financial services into an accessible narrative. App Store visuals were also designed for both iOS and tablet, extending the product''s presence across all touchpoints."}
  ]'::jsonb
WHERE title ILIKE '%Norma%';

-- 2. Hot Pepper
UPDATE projects 
SET 
  roles = ARRAY['Product UI Design'],
  industries = 'Web Platform',
  date = '2025',
  content_blocks = '[
    {"id": "p1", "type": "text", "value": "When I came on board, Hot Pepper''s design files lacked structure and the handoff process between design and development wasn''t working efficiently."},
    {"id": "p2", "type": "text", "value": "I started with a full audit of the existing file to identify inconsistencies and consolidate repeating components. From there, I built the design system from scratch. Component and variable naming was aligned with the engineering side from the beginning."},
    {"id": "p3", "type": "text", "value": "Variables were exported as JSON and handed directly to the developer, which allowed implementation to start immediately without interpretation or back-and-forth. The entire system was delivered within a month."},
    {"id": "p4", "type": "text", "value": "As the platform scaled, the system held. New features were introduced without fragmenting the interface, and both teams could move forward referencing the same language."}
  ]'::jsonb
WHERE title ILIKE '%Hot Pepper%';

-- 3. Frink
UPDATE projects 
SET 
  roles = ARRAY['Product Design'],
  industries = 'Mobile Application, Website',
  date = '2025',
  content_blocks = '[
    {"id": "p1", "type": "text", "value": "Frink''s existing app had fallen behind user expectations. The interface was outdated, key features were missing, and operational load had grown, all of which was reflected in declining sales."},
    {"id": "p2", "type": "text", "value": "The process started with visual direction. Multiple style variations were explored before committing to a direction, then moved into wireframes for client approval before any UI work began. This two-stage review kept feedback focused and prevented late-stage changes."},
    {"id": "p3", "type": "text", "value": "Recurring actions like finding nearby cafés, checking eligibility, and confirming usage were reduced to as few steps as possible. The product was rebuilt around the habits of daily use, not occasional interaction."}
  ]'::jsonb
WHERE title ILIKE '%Frink%';

-- 4. Elva Face Yoga
UPDATE projects 
SET 
  roles = ARRAY['Product Design & Branding'],
  industries = 'Mobile Application',
  date = '2025',
  content_blocks = '[
    {"id": "p1", "type": "text", "value": "The client had no fixed direction and gave me full creative ownership from the start. I led the process through moodboards and competitive benchmarking before proposing a visual direction, which we refined together through collaborative sessions."},
    {"id": "p2", "type": "text", "value": "The identity was built around three core colors drawn from sun and nature, aiming for a calm and trustworthy feel. User flows were defined based on benchmarking and UX research."},
    {"id": "p3", "type": "text", "value": "The onboarding flow collects user input and generates a personalized exercise plan through AI. Users can also ask questions through an AI chat, making the experience adaptive rather than static."},
    {"id": "p4", "type": "text", "value": "Progress indicators and structured flows were designed to support long-term consistency, not just initial engagement."}
  ]'::jsonb
WHERE title ILIKE '%Elva%' OR title ILIKE '%Face Yoga%';

-- 5. Loodos
UPDATE projects 
SET 
  roles = ARRAY['Website Design'],
  industries = 'Corporate Website',
  date = '2025',
  content_blocks = '[
    {"id": "p1", "type": "text", "value": "Loodos is a technology company operating across multiple verticals, but the website didn''t reflect the scale or credibility of the business. Senior decision-makers visiting the site couldn''t understand what the company did and didn''t trust what they saw. This was a direct barrier to reaching the segment the company was targeting."},
    {"id": "p2", "type": "text", "value": "As part of the in-house design team, I led the redesign initiative. We explored five to six concepts internally, pushing to find the strongest possible direction rather than settling early."},
    {"id": "p3", "type": "text", "value": "The logo was modeled and animated from scratch in Spline, giving the brand a distinct visual presence without losing its corporate tone. The site was rebuilt from structure to final interface with the goal of establishing clarity and credibility within the first few seconds of a visit."}
  ]'::jsonb
WHERE title ILIKE '%Loodos%';

-- 6. The View Hospital
UPDATE projects 
SET 
  roles = ARRAY['Website Design'],
  industries = 'Healthcare Website',
  date = '2025',
  content_blocks = '[
    {"id": "p1", "type": "text", "value": "I designed the full UI for The View Hospital''s website, then built a component system manageable through Webflow CMS. The need came directly from the client — they wanted to be able to update and manage the site independently."},
    {"id": "p2", "type": "text", "value": "After identifying that image-heavy layouts were a primary content pattern, I designed components around that need. Each component was built to work independently, giving the team flexibility to build and update pages without design involvement."},
    {"id": "p3", "type": "text", "value": "Healthcare users often arrive under stress, so navigation was kept predictable and direct. Readability and trust were prioritized over visual complexity."}
  ]'::jsonb
WHERE title ILIKE '%View Hospital%';

-- 7. Humble
UPDATE projects 
SET 
  roles = ARRAY['Website Design'],
  industries = 'Corporate Website',
  date = '2025',
  content_blocks = '[
    {"id": "p1", "type": "text", "value": "I designed Humble''s website end-to-end, covering structure, interface, and visual direction. The process started with moodboards and competitive benchmarking before moving into design."},
    {"id": "p2", "type": "text", "value": "The first direction featured a 3D bubble element with connecting nodes. After client feedback pushing for a more artistic approach, I shifted to an animated 3D line element built in Spline, a stronger visual that better matched the brand''s tone."},
    {"id": "p3", "type": "text", "value": "Beyond the visual direction, the site''s content structure was undefined. I organized and rewrote the incoming content to create a coherent narrative flow across the page. The final site was developed in Webflow in close collaboration with a Webflow developer."}
  ]'::jsonb
WHERE title ILIKE '%Humble%';

-- 8. Firecrawl
UPDATE projects 
SET 
  roles = ARRAY['Interactive Visual Design'],
  industries = 'Launch Campaign',
  date = '2025',
  content_blocks = '[
    {"id": "p1", "type": "text", "value": "Firecrawl needed an interactive experience to anchor their launch week, where multiple features were being announced simultaneously. The concept and execution were entirely self-directed — the team reviewed and approved, but the creative decisions were mine throughout."},
    {"id": "p2", "type": "text", "value": "The initial direction explored a flame-based visual. After reviewing together, we shifted toward the logo itself as the interactive element, a stronger and more brand-aligned choice."},
    {"id": "p3", "type": "text", "value": "The result was a WebGL-based visual built in Spline. The logo rotated on its own axis and could be grabbed and spun by the user, turning a static brand mark into something you could interact with. The piece was published on X and LinkedIn and drove significant engagement throughout launch week."}
  ]'::jsonb
WHERE title ILIKE '%Firecrawl%';
