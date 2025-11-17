import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, ArrowRight, TrendingUp } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export const blogs = [
  {
    id: 1,
    slug: "hidden-credit-card-tricks",
    title: "The Credit Card Secrets Nobody Tells You About",
    excerpt: "I stumbled upon these lesser-known strategies purely by accident. What started as casual research turned into ₹80,000 in annual savings. Here's everything I learned.",
    image: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&h=600&fit=crop",
    category: "Savings Tips",
    author: "Vikram Malhotra",
    date: "2 days ago",
    readTime: "8 min read",
    tags: ["Rewards", "Cashback", "Pro Tips"],
    content: `
# The Credit Card Secrets Nobody Tells You About

Let me tell you something most banks won't: you're probably leaving thousands of rupees on the table every month. I know because I was doing exactly that until last year.

## How It All Started

I was having chai with my friend Rohan, complaining about my mounting expenses, when he casually mentioned he'd saved over ₹80,000 last year just by "using his cards smarter." I thought he was exaggerating. Turns out, he wasn't.

## The Welcome Bonus Loophole

Here's the first secret: welcome bonuses are your biggest wealth transfer opportunity. Most people sign up for a card, use it casually, and never think about it again. Here's what smart users do:

**The Strategy:**
- Time your big purchases with new card applications
- Stack welcome bonuses with existing offers (Flipkart sale + card bonus = double benefit)
- Meet the spend threshold naturally, never force purchases

I saved ₹15,000 in my first month just by timing my laptop purchase with a new card application.

## The Redemption Multiplier

Most people redeem points for cash or gift vouchers. That's leaving 40-60% value on the table. Here's the hierarchy of redemption value:

1. **Flight bookings** (Best value - often 1 point = ₹1.5-2)
2. **Hotel stays** (Good value - 1 point = ₹1-1.5)
3. **Shopping vouchers** (Okay value - 1 point = ₹0.8-1)
4. **Cashback** (Worst value - 1 point = ₹0.25-0.50)

## The Category Rotation Trick

This one's clever. Many cards give rotating bonus categories every quarter. Set a calendar reminder to:
- Check which categories are getting bonus rewards
- Move your spending to those categories
- Use different cards for different categories

I use one card for groceries (5% back), another for fuel (4% back), and a third for dining (10% rewards). It sounds complicated but takes literally 2 minutes to track.

## The Fee Waiver Technique

Annual fees killing your savings? Here's what I do every year:

Call customer service 2 months before renewal and say: "I love this card, but the fee is too high. Can we work something out?"

Success rate? About 70%. They'll either:
- Waive the fee completely
- Offer you extra rewards worth more than the fee
- Downgrade you to a no-fee variant (if that works for you)

Last year, I got ₹12,000 in fees waived across 3 cards. One 15-minute call each.

## The Real Numbers

After implementing all this, here's what my year looked like:

- Welcome bonuses: ₹18,000
- Smart redemptions: ₹32,000
- Category optimization: ₹19,000
- Fee waivers: ₹12,000
- **Total saved: ₹81,000**

And I didn't change my spending habits. I just spent smarter.

## The Biggest Mistake

Here's what NOT to do: never carry a balance just to earn rewards. The 3% interest you're paying monthly will eat up any 1-2% cashback you're earning. Always, always pay your full bill on time.

## Getting Started

If you're new to this, start simple:
1. Pick one card with good rewards in your biggest spending category
2. Set up autopay for the full amount
3. Track your rewards monthly
4. Once comfortable, add one more card for a different category

The goal isn't to have 10 cards. It's to have the right cards used the right way.

## Final Thoughts

Credit cards aren't evil, and they aren't magic. They're tools. Used correctly, they put money back in your pocket. Used incorrectly, they do the opposite.

Start with one strategy from this list. Master it. Then add another. In six months, you'll wonder how you ever managed without optimizing this.

*Have questions? Drop them in the comments. I read and respond to everything.*
    `
  },
  {
    id: 2,
    slug: "travel-cards-business-class",
    title: "How I Flew Business Class Without Paying For It",
    excerpt: "Two years ago, I couldn't afford economy. Last month, I flew business to Singapore. No, I didn't win a lottery. Here's exactly how I did it.",
    image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&h=600&fit=crop",
    category: "Travel Rewards",
    author: "Priya Singh",
    date: "5 days ago",
    readTime: "12 min read",
    tags: ["Travel", "Miles", "Lounge Access"],
    content: `
# How I Flew Business Class Without Paying For It

Two years ago, the thought of flying business class was laughable. I was pinching pennies, flying the cheapest economy seats, no meals, no nothing. Last month, I flew Singapore Airlines business class to Singapore, and it cost me exactly zero rupees.

No, I didn't rob a bank. I didn't inherit money. I just figured out how the travel points game actually works.

## The Mindset Shift

First, stop thinking about credit cards as just payment tools. Think of them as mini investment vehicles. Every rupee you spend can earn you 0.5% to 10% back. Multiply that across your annual spending, and you're looking at real money.

For me, annual spending is roughly ₹10 lakhs (groceries, bills, shopping, dining - everything goes on cards). At an average 4% return through strategic card use, that's ₹40,000 back in my pocket every year. That's a free international trip.

## The Cards That Changed Everything

I use a combination of three cards:
1. **For flights**: A premium travel card with no foreign transaction fees and 5 miles per ₹100
2. **For dining & hotels**: A lifestyle card giving 10x rewards on dining and travel bookings
3. **For everything else**: A cashback card with flat 1.5% on all spends

The key? Different cards for different purposes. One-card-for-everything is leaving money on the table.

## The Lounge Access Hack

Here's something most people don't know: you don't need expensive cards for lounge access. Mid-tier cards (₹2,000-5,000 annual fee) often give 4-8 complimentary lounge visits per year.

I stacked two cards = 12 lounge visits annually. Considering each lounge visit costs ₹2,000-3,000 if paid directly, I'm getting ₹24,000-36,000 value from a ₹7,000 annual fee.

Plus, free food, drinks, Wi-Fi, and comfortable seating. When you're taking 6-8 flights a year, this adds up fast.

## The Miles Earning Strategy

Here's my formula:
- **All flights booked through card's travel portal**: 5x miles
- **All hotel bookings**: 10x points
- **All dining out**: 10x points
- **Everything else**: Minimum 1x points

In 2023, I earned roughly 2,50,000 miles/points. That's enough for:
- 2 domestic round trips in business class, OR
- 1 international economy round trip + 2 domestic round trips, OR
- 1 international business one-way + domestic trips

I chose the Singapore business class. Worth it? Absolutely.

## The Redemption Sweet Spot

Not all redemptions are equal. Here's the value ladder:

**Poor value (avoid):**
- Redeeming for cashback: 1 point = ₹0.25
- Shopping vouchers: 1 point = ₹0.30-0.50

**Good value:**
- Economy flights: 1 point = ₹0.80-1.00
- Hotel stays: 1 point = ₹1.00

**Excellent value:**
- Business class flights: 1 point = ₹1.50-2.50
- Premium hotel redemptions: 1 point = ₹2.00

Always, always redeem for maximum value. Those Singapore business tickets would've cost ₹1,80,000 if purchased. I redeemed 1,20,000 miles. That's ₹1.50 per mile - excellent value.

## The Timing Game

Flight prices fluctuate wildly. Miles prices? Usually fixed. This is your arbitrage opportunity.

**The strategy:**
- Book flights 2-4 months in advance using miles
- Book during off-peak (Tuesday-Thursday departures)
- Avoid peak holiday season unless you book 6+ months early

I booked my Singapore flight in February for an April trip. If I'd waited till March, same redemption would've cost 40% more miles.

## Mistakes I Made (So You Don't Have To)

**Mistake 1:** Redeeming miles for ₹500 Amazon vouchers
**Learning:** Wait for high-value redemptions. Miles don't expire if you use the card regularly.

**Mistake 2:** Paying annual fees without negotiating
**Learning:** Always call retention team. They'll waive fees or give bonus points worth more than the fee.

**Mistake 3:** Not tracking points expiry
**Learning:** Set calendar reminders. Lost 30,000 points once because I forgot to redeem.

## The Real Cost Analysis

People say "travel cards have high fees." Let's do the math on my primary card:

- Annual fee: ₹10,000
- Lounge visits value: ₹24,000
- Flight bookings bonus: ~₹18,000
- No forex markup savings: ~₹8,000
- Welcome/renewal bonus: ₹10,000
- **Net benefit: ₹50,000**

Even after paying ₹10,000, I'm up ₹40,000. That's a no-brainer.

## Getting Started (If You're New)

Don't jump into premium cards immediately. Here's a roadmap:

**Year 1:** Get a basic travel card (₹500-1,000 fee). Learn the game. Build credit history.

**Year 2:** Upgrade to mid-tier (₹2,000-5,000 fee). Start accumulating serious miles.

**Year 3:** If you're spending ₹5L+ annually, consider premium cards (₹10,000+ fee). The benefits justify the cost.

## The Bigger Picture

This isn't about gaming the system. It's about being smart with money you're already spending. I don't spend more to earn points. I just route my existing spending through the right cards.

Result? I've taken 3 international trips in 2 years, all on miles and points. Total out-of-pocket cost for flights? Zero.

Not bad for just paying attention to where I swipe my card.

*Thinking of getting started? Drop your questions below. Happy to help.*
    `
  },
  {
    id: 3,
    slug: "credit-score-masterclass",
    title: "I Raised My Credit Score from 650 to 805 in 6 Months",
    excerpt: "Bad credit felt like a life sentence. Banks rejected me, interest rates were brutal. Then I discovered what actually matters. This is my exact playbook.",
    image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&h=600&fit=crop",
    category: "Credit Building",
    author: "Amit Desai",
    date: "1 week ago",
    readTime: "10 min read",
    tags: ["Credit Score", "Financial Health", "Banking"],
    content: `
# I Raised My Credit Score from 650 to 805 in 6 Months

Six months ago, my credit score was 650. Not terrible, but not good either. Banks offered me cards with ₹10,000 limits and 42% interest rates. Personal loans? Forget about it. Or if approved, at rates that would make you weep.

Today, my score is 805. I get pre-approved offers for premium cards. Personal loan offers at 10-12% interest. The same banks that rejected me are now courting me.

What changed? Not my income. Not my spending. Just my understanding of how credit scores actually work.

## What I Didn't Know (And You Probably Don't Either)

Everyone talks about paying bills on time. Yes, that matters. But that's like saying "eat food" is diet advice. Here's what actually moves the needle:

### The 30% Rule (Most Important)

Your credit utilization ratio - how much credit you're using vs. how much you have available - is HUGE. Banks want to see you using credit responsibly, not desperately.

**What I was doing wrong:**
I had one card with ₹50,000 limit. I'd spend ₹35,000-40,000 monthly. That's 70-80% utilization. To banks, this screams "financially stretched."

**What I changed:**
Got 2 more cards (even with low limits initially). Now I had ₹1,20,000 total limit. Same ₹35,000 spending = only 29% utilization.

**Impact:** Score jumped 35 points in 2 months. I didn't change spending. Just spread it across cards.

### The Mix That Matters

Banks like seeing diversity. Only credit cards? You're one-dimensional. Here's the ideal mix:
- Credit cards (unsecured)
- Personal loan or car loan (secured/unsecured)
- Maybe a small EMI from Amazon/Flipkart

Why? It shows you can handle different types of credit responsibly.

I took a small ₹50,000 personal loan at 12% and paid it back in 6 months. Cost me ₹4,000 in interest but added 25 points to my score. Worth it.

### The Hard Inquiry Trap

Every time you apply for credit (card, loan, anything), banks do a "hard inquiry" on your report. Too many in a short time? Red flag.

**My mistake:** Applied for 4 cards in 2 months when I was desperate. Each rejection hurt my score more.

**The fix:** Space out applications. One every 3-4 months max. And only apply when you're likely to be approved.

### The Age Factor

Average age of your credit accounts matters. Close your oldest card? You just reduced your credit history length. Bad move.

I almost closed my first card (₹500 annual fee seemed wasteful). Then I learned it was my oldest account (3 years). Keeping it boosted my score. I called them, got the fee waived.

## The 6-Month Transformation Plan

Here's exactly what I did, month by month:

**Month 1-2:**
- Got credit report (free from CIBIL once a year)
- Disputed two errors (old address, one wrongly reported late payment)
- Reduced utilization to under 30% by getting a second card

**Result:** 650 → 685

**Month 3-4:**
- Set up autopay for FULL amount (not minimum)
- Took small personal loan to add to credit mix
- Started using cards for small recurring payments (Netflix, Spotify)

**Result:** 685 → 730

**Month 5-6:**
- Kept utilization under 20%
- Closed personal loan (showing I can borrow and repay responsibly)
- Maintained perfect payment record

**Result:** 730 → 805

## The Myths I Stopped Believing

**Myth 1:** "Checking your credit score hurts it"
**Truth:** Soft inquiries (you checking) don't hurt. Hard inquiries (banks checking for credit applications) do.

**Myth 2:** "Carry a small balance to build credit"
**Truth:** Banks can see you're using the card even if you pay in full. Carrying a balance just costs you interest.

**Myth 3:** "Close cards you don't use"
**Truth:** Keeping them open helps utilization ratio and average account age. Just use them once in 3-6 months.

## The Mistakes That Cost Me

**Paid only minimum due for 3 months:** Thought I was being smart by preserving cash. Banks saw it as financial stress. Score dropped 20 points.

**Applied for credit when I didn't need it:** Saw a "pre-approved" offer and applied. Rejection hurt more than if I'd just ignored it.

**Ignored errors on report:** Had an old address and one incorrect late payment. Disputing them added 15 points instantly.

## What a Good Score Actually Gets You

At 650, I was getting:
- Credit cards with ₹10,000-50,000 limits
- Personal loans at 18-24% interest
- Rejections from premium cards
- Higher insurance premiums (yes, they check credit scores)

At 805, I'm getting:
- Credit cards with ₹2-5 lakh limits
- Personal loan offers at 10-12%
- Pre-approved for premium cards
- Better rates on car insurance

The difference in a ₹5 lakh personal loan at 24% vs 12% over 3 years? About ₹1.2 lakhs. That's real money.

## The Fastest Way to Improve (If Starting Now)

If your score is below 750, do this immediately:

1. **Get your credit report** - Know what you're working with
2. **Dispute any errors** - 30% of reports have errors
3. **Set up autopay** - Never miss a payment again
4. **Lower utilization under 30%** - Get a new card if needed
5. **Don't apply for new credit for 6 months** - Let your score stabilize

Then wait. Credit scores improve with time and consistency, not overnight hacks.

## The Bottom Line

Your credit score isn't a judgment of your worth. It's a number that banks use to decide how much of a risk you are. Once I understood what actually influences that number, improving it became systematic, not stressful.

650 to 805 in 6 months isn't magic. It's understanding the rules and playing by them. And the best part? Once you hit 750+, you're golden. Banks fight for your business.

That's a nice feeling after years of fighting for theirs.

*Questions? Comments? Share your credit score journey below.*
    `
  }
];

const BlogSection = () => {
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    if (cardsRef.current.length === 0) return;

    // Stagger animation for blog cards
    gsap.fromTo(
      cardsRef.current,
      { 
        opacity: 0, 
        y: 60,
        scale: 0.95
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.8,
        stagger: 0.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 70%",
          end: "top 40%",
          scrub: 1,
        }
      }
    );
  }, []);

  return (
    <section ref={sectionRef} className="py-20 bg-gradient-to-br from-muted/30 via-background to-accent/10">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-semibold">Expert Insights</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
            Real Stories, Real Strategies
          </h2>
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto">
            Learn from people who've mastered the art of maximizing credit card rewards and savings
          </p>
        </div>

        {/* Blog Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {blogs.map((blog, index) => (
            <div
              key={blog.id}
              ref={(el) => {
                if (el) cardsRef.current[index] = el;
              }}
              onClick={() => navigate(`/blog/${blog.slug}`)}
              className="group bg-card rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-border/50 hover:border-primary/30 hover:-translate-y-2 cursor-pointer"
            >
              {/* Image */}
              <div className="relative h-56 overflow-hidden">
                <img
                  src={blog.image}
                  alt={blog.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute top-4 left-4">
                  <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                    {blog.category}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Meta */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{blog.date}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{blog.readTime}</span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors line-clamp-2">
                  {blog.title}
                </h3>

                {/* Excerpt */}
                <p className="text-muted-foreground mb-4 line-clamp-3 leading-relaxed">
                  {blog.excerpt}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {blog.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Author & CTA */}
                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{blog.author}</p>
                    <p className="text-xs text-muted-foreground">Author</p>
                  </div>
                  <div className="flex items-center gap-2 text-primary font-medium group-hover:translate-x-1 transition-all">
                    Read More
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
