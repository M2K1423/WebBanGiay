export type Story = {
  slug: string;
  title: string;
  desc: string;
  meta: string;
  date: string;
  readTime: string;
  author: string;
  image: string;
  content: string; // Markdown or HTML content
};

export const STORIES: Story[] = [
  {
    slug: "find-your-perfect-size",
    title: "Find Your Perfect Size",
    desc: "Easy tips for a comfy fit and hassle-free shoe sizing at home.",
    meta: "Guide",
    date: "July 5, 2026",
    readTime: "4 min read",
    author: "Sizing Expert",
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=800",
    content: `
      <h2>Why Shoe Size Matters</h2>
      <p>Finding the right shoe size is crucial not just for comfort, but also for foot health. Tight shoes can cause blisters, calluses, and ingrown toenails, while loose shoes can lead to slipping, instability, and ankle sprains. In this guide, we will show you how to measure your feet accurately at home and choose the perfect size.</p>

      <h2>How to Measure Your Foot Length at Home</h2>
      <p>Follow these simple steps to measure your foot length accurately:</p>
      <ol>
        <li><strong>Prepare your tools:</strong> Get a piece of paper (larger than your foot), a pencil or pen, and a ruler or tape measure.</li>
        <li><strong>Place your foot:</strong> Put the paper on a flat, hard surface, and step onto it with your weight distributed evenly. Wear the socks you plan to wear with the shoes.</li>
        <li><strong>Trace your foot:</strong> Keep the pen vertical and trace the outline of your foot as closely as possible.</li>
        <li><strong>Measure the length:</strong> Use the ruler to measure the distance from the back of the heel to the tip of your longest toe. Write down this number in centimeters (cm).</li>
        <li><strong>Repeat for the other foot:</strong> Most people have one foot slightly larger than the other. Use the larger measurement to select your shoe size.</li>
      </ol>

      <h2>Shoe Size Conversion Chart</h2>
      <p>Use the table below to convert your foot length in centimeters to standard shoe sizes:</p>
      
      <table style="width: 100%; border-collapse: collapse; margin-top: 15px; margin-bottom: 15px;">
        <thead>
          <tr style="background-color: #f8fafc; border-bottom: 2px solid #e2e8f0; text-align: left;">
            <th style="padding: 10px; font-weight: bold;">Foot Length (cm)</th>
            <th style="padding: 10px; font-weight: bold;">EU Size</th>
            <th style="padding: 10px; font-weight: bold;">US Size (Men)</th>
            <th style="padding: 10px; font-weight: bold;">US Size (Women)</th>
            <th style="padding: 10px; font-weight: bold;">UK Size</th>
          </tr>
        </thead>
        <tbody>
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 10px;">24.0 cm</td>
            <td style="padding: 10px;">38</td>
            <td style="padding: 10px;">5.5</td>
            <td style="padding: 10px;">7.0</td>
            <td style="padding: 10px;">5.0</td>
          </tr>
          <tr style="border-bottom: 1px solid #e2e8f0; background-color: #f8fafc;">
            <td style="padding: 10px;">24.5 cm</td>
            <td style="padding: 10px;">39</td>
            <td style="padding: 10px;">6.5</td>
            <td style="padding: 10px;">8.0</td>
            <td style="padding: 10px;">6.0</td>
          </tr>
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 10px;">25.0 cm</td>
            <td style="padding: 10px;">40</td>
            <td style="padding: 10px;">7.0</td>
            <td style="padding: 10px;">8.5</td>
            <td style="padding: 10px;">6.5</td>
          </tr>
          <tr style="border-bottom: 1px solid #e2e8f0; background-color: #f8fafc;">
            <td style="padding: 10px;">25.5 cm</td>
            <td style="padding: 10px;">41</td>
            <td style="padding: 10px;">8.0</td>
            <td style="padding: 10px;">9.5</td>
            <td style="padding: 10px;">7.5</td>
          </tr>
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 10px;">26.0 cm</td>
            <td style="padding: 10px;">42</td>
            <td style="padding: 10px;">8.5</td>
            <td style="padding: 10px;">10.0</td>
            <td style="padding: 10px;">8.0</td>
          </tr>
          <tr style="border-bottom: 1px solid #e2e8f0; background-color: #f8fafc;">
            <td style="padding: 10px;">26.5 cm</td>
            <td style="padding: 10px;">43</td>
            <td style="padding: 10px;">9.5</td>
            <td style="padding: 10px;">11.0</td>
            <td style="padding: 10px;">9.0</td>
          </tr>
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 10px;">27.0 cm</td>
            <td style="padding: 10px;">44</td>
            <td style="padding: 10px;">10.0</td>
            <td style="padding: 10px;">11.5</td>
            <td style="padding: 10px;">9.5</td>
          </tr>
        </tbody>
      </table>

      <h2>Pro Tips for Getting the Best Fit</h2>
      <ul>
        <li><strong>Measure later in the day:</strong> Feet swell naturally throughout the day, especially after walking. It is best to measure your feet in the afternoon or evening.</li>
        <li><strong>Consider foot width:</strong> If you have wide feet or a high instep, consider ordering a half-size larger or choosing shoes with a wider toe-box (like retro running shoes or canvas sneakers).</li>
        <li><strong>Think about the shoe type:</strong> Running shoes usually require a little extra toe space (about a thumb's width from your longest toe to the end of the shoe) to allow for movement, while casual sneakers should fit snug but comfortable.</li>
      </ul>
    `
  },
  {
    slug: "running-trends-2026",
    title: "Running Trends 2026",
    desc: "Unveiling the latest running shoe technologies, styles, and neon colors taking over the track.",
    meta: "News",
    date: "July 6, 2026",
    readTime: "5 min read",
    author: "Gear Reviewer",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800",
    content: `
      <h2>The Evolution of Running Footwear</h2>
      <p>The year 2026 brings an exciting blend of technology, comfort, and bold fashion statement to the running community. Brands are pushing limits, creating foam compounds that offer higher energy return while maintaining an ultralight profile. Let's look at the key trends dominating the running space this season.</p>

      <h2>1. Super Foams and Carbon Fiber Plates</h2>
      <p>No longer restricted to elite marathoners, carbon-fiber plate technology is making its way to daily trainers. These plates, embedded inside responsive 'super foam' midsoles, act as a springboard, propelling the runner forward with each stride. This reduces muscle fatigue and increases running efficiency, allowing you to run faster and longer.</p>

      <h2>2. Bold Neon Aesthetics</h2>
      <p>Subtle black and white running shoes are taking a back seat in 2026. Vibrant neon green, hot pink, orange, and electric blue are the color palettes of choice. Beyond making runners look stylish, these high-visibility neon colorways offer crucial safety benefits, ensuring runners remain visible to traffic during early morning or late night runs.</p>

      <h2>3. Eco-Friendly and Sustainable Materials</h2>
      <p>Environmental responsibility is a primary focus of shoe designers in 2026. Running uppers are increasingly made from recycled ocean plastics, plant-based fibers, and biodegradable meshes. Midsoles are also utilizing bio-foams derived from sugarcane, proving that performance and sustainability can coexist beautifully.</p>

      <h2>How to Choose the Right Running Shoe</h2>
      <p>With so many options, here are three things to ask yourself before buying:</p>
      <ul>
        <li><strong>What is your arch type?</strong> Flat feet usually benefit from stability shoes, while high arches need neutral cushioning.</li>
        <li><strong>Where do you run?</strong> Choose road-running shoes for paved surfaces, or trail-running shoes with rugged outsoles for dirt tracks.</li>
        <li><strong>What is your mileage?</strong> For daily short runs, lightweight trainers are perfect. For marathon preparation, look for max-cushioning shoes that absorb impact over long distances.</li>
      </ul>
    `
  },
  {
    slug: "keep-your-shoes-fresh",
    title: "Keep Your Shoes Fresh",
    desc: "Simple, highly effective tips to clean, protect, and extend the lifespan of your sneakers.",
    meta: "Blog",
    date: "July 4, 2026",
    readTime: "3 min read",
    author: "Sneakerhead",
    image: "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&q=80&w=800",
    content: `
      <h2>Protect Your Investment</h2>
      <p>Sneakers are more than just footwear; they are an investment in your comfort, style, and identity. Keeping them clean and fresh doesn't just make them look brand new; it also prevents materials from breaking down prematurely. Here is a simple, sneaker-approved care guide to keep your pairs fresh.</p>

      <h2>The Golden Rules of Sneaker Care</h2>
      <p>Here are the step-by-step cleaning basics to follow:</p>
      <ol>
        <li><strong>Never throw shoes in the washing machine:</strong> The harsh spinning and hot water can melt glue, warp materials, and fade colors. Always hand-wash.</li>
        <li><strong>Brush away dry dirt:</strong> Before using any liquid cleaner, use a dry, soft-bristled brush to sweep away loose dirt and dust from the upper and sole.</li>
        <li><strong>Clean uppers and midsoles separately:</strong> Use a warm water mixture with a mild sneaker cleaning solution or baby soap. Gently scrub the upper, then use a stiffer brush for the midsole and outsole.</li>
        <li><strong>Air dry naturally:</strong> Never put your shoes in the dryer. Instead, stuff them with paper towels to absorb moisture and preserve shape, and let them dry in a well-ventilated shade, away from direct sunlight.</li>
      </ol>

      <h2>Material-Specific Care Tips</h2>
      
      <table style="width: 100%; border-collapse: collapse; margin-top: 15px; margin-bottom: 15px;">
        <thead>
          <tr style="background-color: #f8fafc; border-bottom: 2px solid #e2e8f0; text-align: left;">
            <th style="padding: 10px; font-weight: bold;">Material</th>
            <th style="padding: 10px; font-weight: bold;">Cleaning Tool</th>
            <th style="padding: 10px; font-weight: bold;">Best Practices</th>
          </tr>
        </thead>
        <tbody>
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 10px;"><strong>Leather</strong></td>
            <td style="padding: 10px;">Microfiber cloth + soft brush</td>
            <td style="padding: 10px;">Easy to wipe clean. Apply leather conditioner to prevent cracking.</td>
          </tr>
          <tr style="border-bottom: 1px solid #e2e8f0; background-color: #f8fafc;">
            <td style="padding: 10px;"><strong>Suede / Nubuck</strong></td>
            <td style="padding: 10px;">Suede brush + eraser</td>
            <td style="padding: 10px;">NEVER wet suede. Use dry eraser for stains and brush to restore nap.</td>
          </tr>
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 10px;"><strong>Canvas / Mesh</strong></td>
            <td style="padding: 10px;">Soft brush + soapy water</td>
            <td style="padding: 10px;">Scrub gently in circular motion. Rinse with microfiber cloth.</td>
          </tr>
        </tbody>
      </table>

      <h2>Smart Storage Habits</h2>
      <ul>
        <li><strong>Use water-repellent spray:</strong> Apply a protective shoe protector spray before wearing your sneakers for the first time. It creates an invisible shield that repels water and prevents stains.</li>
        <li><strong>Use cedar shoe trees:</strong> Insert shoe trees (or stuff them with clean white paper) when storing to maintain the shape of the toe box. Cedar wood also absorbs moisture and controls odor.</li>
        <li><strong>Keep them cool:</strong> Store your shoes in their original boxes or plastic shoe crates in a cool, dry place. Avoid hot attics or damp basements.</li>
      </ul>
    `
  }
];
