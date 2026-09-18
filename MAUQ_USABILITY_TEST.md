# BettingLog - System Usability Testing Plan (MAUQ)

**Purpose.** Document how to run the usability / system-acceptance test for
BettingLog using a validated instrument, and how to score and report the
results. This is a **testing plan**, not app code - nothing here ships in the app.

**Instrument.** mHealth App Usability Questionnaire (**MAUQ**), *Standalone App -
patient/user* version. 18 items, 3 subscales, 7-point Likert scale. Chosen
because BettingLog is a standalone mHealth app used directly by the user (no
clinician in the loop), which is exactly the population this MAUQ version was
built and validated for.

**Licensing.** Free to use, no permission or fee required, per the authors. Use
the item wording **verbatim** - re-wording invalidates the instrument.

---

## 1. How many testers? (estimate + rationale)

| Round | Purpose | Testers | Why this number |
|---|---|---|---|
| **A. Formative (optional, do first)** | Catch obvious usability problems before the graded test | **5** | ~5 users surface ~85% of usability problems in a think-aloud round (Nielsen, NN/g). Cheap, fast, iterate before Round B. |
| **B. Summative (the MAUQ test)** | Produce the usability score for the paper | **30** | 30 is the common minimum for a stable mean/Cronbach's alpha in a capstone-scale questionnaire study; large enough for descriptive stats and reliability, small enough to recruit. **20-30 acceptable**; 30 is the target. |

**Recommended: recruit 30** respondents for the MAUQ round (aim to collect at
least 25 complete responses after dropouts). If a formative round is run first,
those 5 can be *different* people or the same - keep the two rounds' data
separate.

**Who they should be (purposive sample).** People who match the app's audience:
adults in the Philippines who gamble or want to reduce gambling, plus a few
proxy testers (e.g. peers) if recruiting the target group is hard. Note any
deviation from the target population as a limitation in the paper.

---

## 2. Test procedure (per tester)

1. **Consent + brief.** Explain it's a usability test of the app, not a test of
   them; answers are anonymous; they can stop anytime.
2. **Install / open** the release build of BettingLog on an Android device.
3. **Task walkthrough** - have them actually use the core flows so their MAUQ
   answers are grounded in real use:
   - Sign up / log in.
   - Complete onboarding (problem -> about you -> apps -> protect -> baseline PGSI).
   - Do a daily check-in (mood + bet-free / gambled).
   - Write a diary note and open the Journey Map.
   - Take the K10 weekly check-in.
   - Open Learn and Profile; set a spending limit.
4. **Administer the MAUQ** (Section 3) immediately after, on paper or a Google
   Form. Every item must be answered.
5. **Optional open question:** "What was confusing or missing?" (1-2 lines) -
   useful qualitative colour for the discussion section.

---

## 3. The questionnaire (verbatim - do not reword)

**Scale (per item):** 1 = Strongly agree, 2, 3, 4 = Neutral, 5, 6, 7 = Strongly
disagree. (Only the endpoints are labelled in the instrument; 4 is the midpoint.)

### Subscale 1 - Ease of Use (5 items)
1. The app was easy to use.
2. It was easy for me to learn to use the app.
3. The navigation was consistent when moving between screens.
4. The interface of the app allowed me to use all the functions (such as entering information, responding to reminders, viewing information) offered by the app.
5. Whenever I made a mistake using the app, I could recover easily and quickly.

### Subscale 2 - Interface and Satisfaction (7 items)
6. I like the interface of the app.
7. The information in the app was well organized, so I could easily find the information I needed.
8. The app adequately acknowledged and provided information to let me know the progress of my action.
9. I feel comfortable using this app in social settings.
10. The amount of time involved in using this app has been fitting for me.
11. I would use this app again.
12. Overall, I am satisfied with this app.

### Subscale 3 - Usefulness (6 items)
13. The app would be useful for my health and well-being.
14. The app improved my access to health care services.
15. The app helped me manage my health effectively.
16. This app has all the functions and capabilities I expected it to have.
17. I could use the app even when the Internet connection was poor or not available.
18. This mHealth app provided an acceptable way to receive health care services, such as accessing educational materials, tracking my own activities, and performing self-assessment.

> Note on items 14 and 18: MAUQ is written for general "health care" apps.
> BettingLog is a gambling harm-reduction self-help app, so read "health care
> services" as "the support and self-help features this app provides." Keep the
> printed wording as-is; explain this framing verbally when briefing testers.

---

## 4. Scoring

MAUQ is scored as the **mean of the item responses** (the paper reports means,
not sums). Because 1 = strongly agree with each *positive* statement:

- **Lower mean = better usability.** (1.0 best, 7.0 worst, 4.0 = neutral.)

Compute:

- **Overall score** = mean of all 18 answered items.
- **Ease of Use** = mean of items 1-5.
- **Interface & Satisfaction** = mean of items 6-12.
- **Usefulness** = mean of items 13-18.

Then across all testers, report each subscale's and the overall **mean +
standard deviation**. Optionally compute **Cronbach's alpha** per subscale to
report internal-consistency reliability (alpha >= 0.70 is the usual threshold).

**Reader-friendly conversion (optional).** To present "higher = better" like a
satisfaction %, convert: `favourable% = (7 - mean) / 6 * 100`. State clearly if
you use this so it isn't confused with the raw MAUQ mean.

---

## 5. Data-collection template

One row per tester (raw 1-7 answers). Compute the four means per row, then
average the columns.

| Tester | Q1 | Q2 | Q3 | Q4 | Q5 | Q6 | Q7 | Q8 | Q9 | Q10 | Q11 | Q12 | Q13 | Q14 | Q15 | Q16 | Q17 | Q18 | EaseUse mean | Interface mean | Useful mean | Overall mean |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| T01 | | | | | | | | | | | | | | | | | | | | | | |
| T02 | | | | | | | | | | | | | | | | | | | | | | |
| ... | | | | | | | | | | | | | | | | | | | | | | |
| **Mean** | | | | | | | | | | | | | | | | | | | | | | |
| **SD** | | | | | | | | | | | | | | | | | | | | | | |

### Results summary (fill in after collection)

| Subscale | # items | Mean | SD | Cronbach's alpha |
|---|---|---|---|---|
| Ease of Use | 5 | | | |
| Interface and Satisfaction | 7 | | | |
| Usefulness | 6 | | | |
| **Overall** | 18 | | | |

Sample size (N complete responses): ____  •  Test dates: ____  •  Build/version tested: ____

---

## 6. Sources

- Zhou L, Bao J, Setiawan IMA, Saptono A, Parmanto B. **The mHealth App Usability
  Questionnaire (MAUQ): Development and Validation Study.** *JMIR mHealth and
  uHealth* 2019;7(4):e11500. https://mhealth.jmir.org/2019/4/e11500/
  (Full text: https://pmc.ncbi.nlm.nih.gov/articles/PMC6482399/) - instrument,
  18 items, 3 subscales, 7-point scale, free-to-use statement.
- Standalone-app PDF used for the exact item wording:
  https://ux.hari.pitt.edu/v2/api/download/MAUQ_SPA_English.pdf
- Nielsen J. **Why You Only Need to Test with 5 Users.** Nielsen Norman Group,
  2000. https://www.nngroup.com/articles/why-you-only-need-to-test-with-5-users/
  - basis for the 5-user formative round.
