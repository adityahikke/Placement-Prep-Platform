package com.placementprep.config;

import com.placementprep.entity.*;
import com.placementprep.repository.*;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

/**
 * Idempotent, run-on-every-startup seeder that augments the base curriculum created
 * by {@link DataInitializer}. Unlike {@code DataInitializer} (which only seeds a brand
 * new/empty database), this runs each boot and uses find-or-create semantics so it can
 * safely top up an already-populated database:
 *
 * <ul>
 *   <li>Adds two new Quantitative Aptitude chapters (Averages, Simple &amp; Compound Interest).</li>
 *   <li>Adds two new CS Fundamentals chapters (TCP/IP &amp; OSI Model under Computer Networks,
 *       OOP Principles &amp; Concepts under Object Oriented Programming) — the two subjects that
 *       previously shipped with no chapters.</li>
 *   <li>Initializes every chapter that has zero questions with a curated set of MCQs, so no
 *       chapter is empty and every one is a valid bulk-upload target.</li>
 *   <li>Ensures a canonical set of DSA problems (each with its LeetCode link) exists.</li>
 * </ul>
 *
 * <p>Questions are only inserted into a chapter when it currently has <em>zero</em> questions,
 * so re-running never creates duplicates and never disturbs chapters that already have content.
 * Runs at {@code @Order(2)}, strictly after {@code DataInitializer} ({@code @Order(1)}).
 */
@Component
@Order(2)
@RequiredArgsConstructor
public class CurriculumSeeder implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(CurriculumSeeder.class);

    private final SectionRepository sectionRepository;
    private final SubjectRepository subjectRepository;
    private final ChapterRepository chapterRepository;
    private final QuestionRepository questionRepository;
    private final DsaProblemRepository dsaProblemRepository;

    @Override
    @Transactional
    public void run(String... args) {
        logger.info("CurriculumSeeder: ensuring chapters exist and no chapter is left empty...");

        Section aptitude = findOrCreateSection("APTITUDE", "Aptitude",
                "Master Quantitative Aptitude, Logical Reasoning, and Verbal Ability with chapter-wise timed tests.",
                "Calculator");
        Section cs = findOrCreateSection("CS_FUNDAMENTALS", "CS Fundamentals",
                "Strengthen core Computer Science subjects including OS, DBMS, Computer Networks, and OOP.",
                "Cpu");
        findOrCreateSection("DSA", "Data Structures & Algorithms",
                "Practice curated coding problems categorized by topic and difficulty with direct status tracking.",
                "Code");

        seedAptitude(aptitude);
        seedCsFundamentals(cs);
        ensureDsaProblems();

        logger.info("CurriculumSeeder: done.");
    }

    // ==========================================================================
    // Aptitude
    // ==========================================================================

    private void seedAptitude(Section aptitude) {
        Subject quant = findOrCreateSubject(aptitude, "Quantitative Aptitude", "QUANT");
        Subject lr = findOrCreateSubject(aptitude, "Logical Reasoning", "LR");
        Subject verbal = findOrCreateSubject(aptitude, "Verbal Ability", "VERBAL");

        // --- Two NEW Quantitative Aptitude chapters (each seeded so bulk upload can target them) ---
        Chapter averages = findOrCreateChapter(quant, "Averages",
                "Simple and weighted averages, average speed, and the effect of adding/replacing a member.", 5);
        Chapter interest = findOrCreateChapter(quant, "Simple & Compound Interest",
                "Simple vs compound interest, non-annual compounding, and the CI-SI difference.", 5);

        // --- Existing Quant chapters that shipped empty ---
        Chapter ratio = findOrCreateChapter(quant, "Ratio and Proportion",
                "Properties of ratios, mean proportions, partnership investments, and coin problems.", 5);
        Chapter numberSystem = findOrCreateChapter(quant, "Number System",
                "Divisibility rules, unit digit calculation, remainders theorem, and factors.", 5);

        // --- Empty Logical Reasoning + Verbal chapters ---
        Chapter codingDecoding = findOrCreateChapter(lr, "Coding-Decoding",
                "Letter shifting, numerical substitutions, matrix codes, and pattern matching.", 5);
        Chapter bloodRelations = findOrCreateChapter(lr, "Blood Relations",
                "Family tree representation, coded relationships, and generational diagrams.", 5);
        Chapter errorSpotting = findOrCreateChapter(verbal, "Error Spotting",
                "Subject-verb agreement, tenses, prepositions, modifiers, and idiomatic usages.", 5);

        seedIfEmpty(averages, averagesQuestions(averages));
        seedIfEmpty(interest, interestQuestions(interest));
        seedIfEmpty(ratio, ratioQuestions(ratio));
        seedIfEmpty(numberSystem, numberSystemQuestions(numberSystem));
        seedIfEmpty(codingDecoding, codingDecodingQuestions(codingDecoding));
        seedIfEmpty(bloodRelations, bloodRelationsQuestions(bloodRelations));
        seedIfEmpty(errorSpotting, errorSpottingQuestions(errorSpotting));
    }

    // ==========================================================================
    // CS Fundamentals
    // ==========================================================================

    private void seedCsFundamentals(Section cs) {
        Subject os = findOrCreateSubject(cs, "Operating Systems", "OS");
        findOrCreateSubject(cs, "DBMS", "DBMS");
        Subject cn = findOrCreateSubject(cs, "Computer Networks", "CN");
        Subject oop = findOrCreateSubject(cs, "Object Oriented Programming", "OOP");

        // --- Two NEW CS Fundamentals chapters (under the subjects that had none) ---
        Chapter tcpip = findOrCreateChapter(cn, "TCP/IP & OSI Model",
                "OSI vs TCP/IP layering, encapsulation, layer responsibilities, protocols, and port numbers.", 5);
        Chapter oopPrinciples = findOrCreateChapter(oop, "OOP Principles & Concepts",
                "Encapsulation, inheritance, polymorphism, abstraction, and compile-time vs run-time binding.", 5);

        // --- Existing OS chapter that shipped empty ---
        Chapter deadlocks = findOrCreateChapter(os, "Deadlocks & Synchronization",
                "Coffman conditions, Banker's Algorithm, Mutex, Semaphores, and Peterson's solution.", 5);

        seedIfEmpty(tcpip, tcpIpQuestions(tcpip));
        seedIfEmpty(oopPrinciples, oopQuestions(oopPrinciples));
        seedIfEmpty(deadlocks, deadlockQuestions(deadlocks));
    }

    // ==========================================================================
    // Question banks (one curated set per chapter)
    // ==========================================================================

    private List<Question> averagesQuestions(Chapter c) {
        List<Question> list = new ArrayList<>();
        list.add(createQ(c, "What is the average of 10, 20, 30, 40 and 50?", "25", "30", "35", "40", "B",
                "Sum = 150. Average = 150 / 5 = 30.", Difficulty.EASY));
        list.add(createQ(c, "The average of the first five natural numbers (1 to 5) is:", "2.5", "3", "3.5", "4", "B",
                "Sum = 15. Average = 15 / 5 = 3.", Difficulty.EASY));
        list.add(createQ(c, "The average age of 30 students is 12 years. If the teacher's age is included, the average increases by 1. Find the teacher's age.", "41", "42", "43", "44", "C",
                "New average = 13. Total with teacher = 31 x 13 = 403. Students' total = 30 x 12 = 360. Teacher = 403 - 360 = 43.", Difficulty.MEDIUM));
        list.add(createQ(c, "A batsman has an average of 40 runs in 10 innings. How many runs must he score in the 11th innings to raise his average to 42?", "60", "62", "64", "66", "B",
                "Required total = 11 x 42 = 462. Current total = 10 x 40 = 400. Needed = 462 - 400 = 62.", Difficulty.MEDIUM));
        list.add(createQ(c, "A car covers equal distances at 40 km/h and 60 km/h. What is its average speed for the whole journey?", "48 km/h", "50 km/h", "52 km/h", "45 km/h", "A",
                "For equal distances, average speed = 2xy/(x+y) = (2 x 40 x 60) / 100 = 48 km/h.", Difficulty.MEDIUM));
        list.add(createQ(c, "The average of 11 results is 50. The average of the first 6 is 49 and of the last 6 is 52. Find the 6th result.", "54", "55", "56", "58", "C",
                "First 6 = 294, last 6 = 312, together = 606 (6th counted twice). Total of 11 = 550. 6th = 606 - 550 = 56.", Difficulty.HARD));
        return list;
    }

    private List<Question> interestQuestions(Chapter c) {
        List<Question> list = new ArrayList<>();
        list.add(createQ(c, "Find the simple interest on Rs 1000 at 10% per annum for 2 years.", "Rs 100", "Rs 150", "Rs 200", "Rs 250", "C",
                "SI = (P x R x T) / 100 = (1000 x 10 x 2) / 100 = Rs 200.", Difficulty.EASY));
        list.add(createQ(c, "Find the compound interest on Rs 5000 at 10% per annum for 2 years.", "Rs 1000", "Rs 1050", "Rs 1100", "Rs 1150", "B",
                "Amount = 5000 x (1.1)^2 = 6050. CI = 6050 - 5000 = Rs 1050.", Difficulty.EASY));
        list.add(createQ(c, "The difference between compound and simple interest on a sum at 10% per annum for 2 years is Rs 50. Find the sum.", "Rs 4000", "Rs 4500", "Rs 5000", "Rs 5500", "C",
                "Difference = P x (R/100)^2 = P x 0.01 = 50, so P = Rs 5000.", Difficulty.MEDIUM));
        list.add(createQ(c, "In how many years will a sum of money double itself at 12.5% per annum simple interest?", "6", "7", "8", "9", "C",
                "To double, SI must equal the principal (100%). T = 100 / 12.5 = 8 years.", Difficulty.MEDIUM));
        list.add(createQ(c, "A sum of Rs 8000 becomes Rs 9261 in 3 years under compound interest. Find the rate of interest.", "4%", "5%", "6%", "7%", "B",
                "9261 / 8000 = 1.157625 = (1.05)^3, so the rate is 5% per annum.", Difficulty.MEDIUM));
        list.add(createQ(c, "The compound interest on a sum for 2 years is Rs 832 and the simple interest for the same period at the same rate is Rs 800. Find the rate of interest.", "6%", "7%", "8%", "10%", "C",
                "SI per year = 400. Extra Rs 32 in CI is one year's interest on the first year's Rs 400, so R = (32/400) x 100 = 8%.", Difficulty.HARD));
        return list;
    }

    private List<Question> ratioQuestions(Chapter c) {
        List<Question> list = new ArrayList<>();
        list.add(createQ(c, "If a : b = 2 : 3 and b : c = 4 : 5, then a : c is:", "8 : 15", "2 : 5", "8 : 12", "3 : 5", "A",
                "a : b : c = 8 : 12 : 15, so a : c = 8 : 15.", Difficulty.EASY));
        list.add(createQ(c, "Rs 600 is divided in the ratio 2 : 3. What is the larger share?", "Rs 300", "Rs 340", "Rs 360", "Rs 400", "C",
                "Total parts = 5. Larger share = (3/5) x 600 = Rs 360.", Difficulty.EASY));
        list.add(createQ(c, "Two numbers are in the ratio 3 : 5. If 9 is added to each, the ratio becomes 3 : 4. Find the smaller number.", "9", "12", "15", "18", "A",
                "Let numbers be 3x and 5x. (3x+9)/(5x+9) = 3/4 gives 12x+36 = 15x+27, so x = 3. Smaller = 3x = 9.", Difficulty.MEDIUM));
        list.add(createQ(c, "Two numbers are in the ratio 4 : 5 and their LCM is 180. Find the sum of the numbers.", "72", "81", "90", "99", "B",
                "Numbers are 4x and 5x with LCM 20x = 180, so x = 9. Numbers 36 and 45; sum = 81.", Difficulty.MEDIUM));
        list.add(createQ(c, "If 40% of a number equals two-thirds of another, the ratio of the first to the second is:", "3 : 5", "5 : 3", "2 : 3", "3 : 2", "B",
                "0.4a = (2/3)b gives a/b = (2/3)/(2/5) = 5/3, so a : b = 5 : 3.", Difficulty.MEDIUM));
        list.add(createQ(c, "A sum is divided among A, B and C in the ratio 2 : 3 : 4. If C gets Rs 500 more than A, find the total sum.", "Rs 2000", "Rs 2250", "Rs 2500", "Rs 2750", "B",
                "C - A = 4x - 2x = 2x = 500, so x = 250. Total = 9x = Rs 2250.", Difficulty.HARD));
        return list;
    }

    private List<Question> numberSystemQuestions(Chapter c) {
        List<Question> list = new ArrayList<>();
        list.add(createQ(c, "What is the unit digit of 7^4?", "1", "3", "7", "9", "A",
                "Unit digits of powers of 7 cycle 7, 9, 3, 1. The 4th is 1.", Difficulty.EASY));
        list.add(createQ(c, "What is the largest three-digit number divisible by 7?", "994", "996", "998", "999", "A",
                "994 = 7 x 142, and the next multiple 1001 is four digits, so 994 is the largest.", Difficulty.EASY));
        list.add(createQ(c, "What is the remainder when 2^10 is divided by 7?", "1", "2", "4", "5", "B",
                "2^3 = 8 leaves remainder 1 mod 7. 2^10 = (2^3)^3 x 2, so remainder = 1 x 2 = 2.", Difficulty.MEDIUM));
        list.add(createQ(c, "How many trailing zeros are there in 25! (25 factorial)?", "4", "5", "6", "7", "C",
                "Count factors of 5: floor(25/5) + floor(25/25) = 5 + 1 = 6.", Difficulty.MEDIUM));
        list.add(createQ(c, "What is the unit digit of the product 17 x 23 x 51 x 89?", "1", "3", "7", "9", "D",
                "Multiply unit digits: 7 x 3 = 21 (1), 1 x 1 = 1, 1 x 9 = 9. Unit digit = 9.", Difficulty.MEDIUM));
        list.add(createQ(c, "How many factors does 360 have?", "20", "22", "24", "28", "C",
                "360 = 2^3 x 3^2 x 5. Number of factors = (3+1)(2+1)(1+1) = 24.", Difficulty.HARD));
        return list;
    }

    private List<Question> codingDecodingQuestions(Chapter c) {
        List<Question> list = new ArrayList<>();
        list.add(createQ(c, "In a certain code, CAT is written as DBU. How is DOG written in that code?", "EPH", "EPG", "FPH", "EQH", "A",
                "Each letter moves +1: D->E, O->P, G->H, giving EPH.", Difficulty.EASY));
        list.add(createQ(c, "If FACE is coded as GBDF, how is HELP coded?", "IFMQ", "IFNQ", "GFMQ", "IEMQ", "A",
                "Each letter moves +1: H->I, E->F, L->M, P->Q, giving IFMQ.", Difficulty.EASY));
        list.add(createQ(c, "If MONDAY is written as NPOEBZ, how is FRIDAY written in the same code?", "GSJEBZ", "GSJEBY", "GSHEBZ", "GSJDBZ", "A",
                "Each letter moves +1: F->G, R->S, I->J, D->E, A->B, Y->Z, giving GSJEBZ.", Difficulty.MEDIUM));
        list.add(createQ(c, "In a code language, ROSE is written as TQUG. How is LILY written?", "NKNA", "NKNB", "MKNA", "NLNA", "A",
                "Each letter moves +2 (wrapping Y to A): L->N, I->K, L->N, Y->A, giving NKNA.", Difficulty.MEDIUM));
        list.add(createQ(c, "If TEACHER is coded as VGCEJGT, what is the code for STUDENT?", "UVWFGPV", "UVWFGPW", "UVWEGPV", "UWWFGPV", "A",
                "Each letter moves +2: S->U, T->V, U->W, D->F, E->G, N->P, T->V, giving UVWFGPV.", Difficulty.MEDIUM));
        list.add(createQ(c, "If 'sky is blue' = 'pa na la' and 'blue is beautiful' = 'na la sa', what is the code for 'sky'?", "pa", "na", "la", "sa", "A",
                "'is blue' is common to both and maps to 'na la'. The remaining word 'sky' therefore maps to 'pa'.", Difficulty.HARD));
        return list;
    }

    private List<Question> bloodRelationsQuestions(Chapter c) {
        List<Question> list = new ArrayList<>();
        list.add(createQ(c, "Pointing to a man, a woman said, \"He is the son of my mother.\" How is the man related to the woman?", "Brother", "Father", "Uncle", "Son", "A",
                "The son of the woman's mother is her brother.", Difficulty.EASY));
        list.add(createQ(c, "P is the mother of Q. Q is the son of R. How is R related to P?", "Husband", "Brother", "Father", "Son", "A",
                "R is Q's parent; since P is Q's mother, R is Q's father and thus P's husband.", Difficulty.EASY));
        list.add(createQ(c, "Pointing to a photograph, a man said, \"I have no brother or sister, but that man's father is my father's son.\" Whose photograph is it?", "His son", "His father", "Himself", "His cousin", "A",
                "'My father's son', with no brothers, is the man himself. So that man's father is the speaker, i.e. the photo is of his son.", Difficulty.MEDIUM));
        list.add(createQ(c, "If A + B means A is the mother of B, A - B means A is the brother of B, and A x B means A is the father of B, which expression shows that P is the maternal uncle of Q?", "P - M + Q", "P + M - Q", "P x M - Q", "P - M x Q", "A",
                "Maternal uncle = brother of the mother. P - M (P is brother of M) and M + Q (M is mother of Q): P - M + Q.", Difficulty.MEDIUM));
        list.add(createQ(c, "Pointing to a lady, Rahul said, \"She is the daughter of my grandfather's only son.\" How is the lady related to Rahul?", "Sister", "Mother", "Aunt", "Cousin", "A",
                "Grandfather's only son is Rahul's father. His daughter is Rahul's sister.", Difficulty.MEDIUM));
        list.add(createQ(c, "A man said to a woman, \"Your mother's husband's sister is my aunt.\" How is the woman related to the man?", "Sister", "Cousin", "Aunt", "Niece", "B",
                "The woman's father's sister is her aunt; being the man's aunt too means their parents are siblings, so they are cousins.", Difficulty.HARD));
        return list;
    }

    private List<Question> errorSpottingQuestions(Chapter c) {
        List<Question> list = new ArrayList<>();
        list.add(createQ(c, "Spot the part that contains an error: 'One of the boys / have not / submitted / his assignment.'",
                "One of the boys", "have not", "submitted", "his assignment", "B",
                "'One of the boys' is singular, so it should be 'has not', not 'have not'.", Difficulty.EASY));
        list.add(createQ(c, "Spot the part that contains an error: 'She is senior / than me / by three years / in college.'",
                "She is senior", "than me", "by three years", "in college", "B",
                "'Senior' takes the preposition 'to', so it should be 'senior to me', not 'senior than me'.", Difficulty.EASY));
        list.add(createQ(c, "Spot the part that contains an error: 'The number of students / in the class / are increasing / every year.'",
                "The number of students", "in the class", "are increasing", "every year", "C",
                "'The number of' takes a singular verb, so it should be 'is increasing'.", Difficulty.MEDIUM));
        list.add(createQ(c, "Spot the part that contains an error: 'He did not / went to / the market / yesterday.'",
                "He did not", "went to", "the market", "yesterday", "B",
                "After the auxiliary 'did', the base form is used: 'did not go', not 'did not went'.", Difficulty.MEDIUM));
        list.add(createQ(c, "Spot the part that contains an error: 'Each of the / students were / given a / separate room.'",
                "Each of the", "students were", "given a", "separate room", "B",
                "'Each' is singular, so the verb should be 'was': 'each of the students was given'.", Difficulty.MEDIUM));
        list.add(createQ(c, "Spot the part that contains an error: 'If I was / you, I would / accept the offer / without hesitation.'",
                "If I was", "you, I would", "accept the offer", "without hesitation", "A",
                "Contrary-to-fact conditions use the subjunctive 'were': 'If I were you'.", Difficulty.HARD));
        return list;
    }

    private List<Question> tcpIpQuestions(Chapter c) {
        List<Question> list = new ArrayList<>();
        list.add(createQ(c, "How many layers are there in the OSI reference model?", "4", "5", "6", "7", "D",
                "The OSI model has 7 layers: Physical, Data Link, Network, Transport, Session, Presentation, and Application.", Difficulty.EASY));
        list.add(createQ(c, "Which layer of the OSI model is primarily responsible for routing packets between networks?", "Data Link", "Network", "Transport", "Session", "B",
                "The Network layer (Layer 3) handles logical addressing and routing.", Difficulty.EASY));
        list.add(createQ(c, "Which Transport-layer protocol provides reliable, connection-oriented delivery?", "IP", "UDP", "TCP", "HTTP", "C",
                "TCP is connection-oriented and reliable; UDP is connectionless and unreliable.", Difficulty.MEDIUM));
        list.add(createQ(c, "How many layers does the TCP/IP model have?", "3", "4", "5", "7", "B",
                "The TCP/IP model has 4 layers: Application, Transport, Internet, and Network Access.", Difficulty.MEDIUM));
        list.add(createQ(c, "Which port number does HTTPS use by default?", "21", "25", "80", "443", "D",
                "HTTPS uses TCP port 443 by default (HTTP uses 80).", Difficulty.MEDIUM));
        list.add(createQ(c, "What is the correct sequence of flags in the TCP three-way handshake?", "SYN -> ACK -> SYN", "SYN -> SYN-ACK -> ACK", "ACK -> SYN -> SYN-ACK", "SYN-ACK -> SYN -> ACK", "B",
                "The handshake is SYN (client), SYN-ACK (server), then ACK (client).", Difficulty.HARD));
        return list;
    }

    private List<Question> oopQuestions(Chapter c) {
        List<Question> list = new ArrayList<>();
        list.add(createQ(c, "Which OOP principle refers to wrapping data and the methods that operate on it into a single unit?", "Inheritance", "Encapsulation", "Polymorphism", "Abstraction", "B",
                "Encapsulation bundles data and behavior together and restricts direct access to internal state.", Difficulty.EASY));
        list.add(createQ(c, "The mechanism by which a class acquires the properties and behavior of another class is called:", "Encapsulation", "Abstraction", "Inheritance", "Overloading", "C",
                "Inheritance lets a subclass reuse and extend a superclass.", Difficulty.EASY));
        list.add(createQ(c, "A single interface representing different underlying types (\"many forms\") describes which principle?", "Abstraction", "Polymorphism", "Encapsulation", "Association", "B",
                "Polymorphism allows one interface to be used for objects of different types.", Difficulty.MEDIUM));
        list.add(createQ(c, "Which concept hides internal implementation details and exposes only the essential features?", "Abstraction", "Inheritance", "Composition", "Overriding", "A",
                "Abstraction exposes what an object does while hiding how it does it.", Difficulty.MEDIUM));
        list.add(createQ(c, "Compile-time (static) polymorphism is typically achieved through:", "Method overriding", "Method overloading", "Virtual functions", "Interfaces", "B",
                "Method overloading is resolved at compile time based on the method signature.", Difficulty.MEDIUM));
        list.add(createQ(c, "Providing a new implementation in a subclass for a method already defined in its parent class is called:", "Overloading", "Overriding", "Shadowing", "Hiding", "B",
                "Method overriding replaces the inherited implementation and enables run-time polymorphism.", Difficulty.HARD));
        return list;
    }

    private List<Question> deadlockQuestions(Chapter c) {
        List<Question> list = new ArrayList<>();
        list.add(createQ(c, "How many necessary conditions (Coffman conditions) must hold simultaneously for a deadlock to occur?", "2", "3", "4", "5", "C",
                "All four must hold: Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait.", Difficulty.EASY));
        list.add(createQ(c, "Which of the following is NOT one of the four Coffman conditions for deadlock?", "Mutual Exclusion", "Hold and Wait", "Preemption", "Circular Wait", "C",
                "The condition is 'No Preemption'; preemption itself actually helps avoid deadlock.", Difficulty.EASY));
        list.add(createQ(c, "The Banker's algorithm is used for:", "Deadlock prevention", "Deadlock avoidance", "Deadlock detection", "Deadlock recovery", "B",
                "The Banker's algorithm checks whether granting a request keeps the system in a safe state, i.e. deadlock avoidance.", Difficulty.MEDIUM));
        list.add(createQ(c, "A semaphore that can take only the values 0 and 1 is called a:", "Counting semaphore", "Binary semaphore", "Weighted semaphore", "Strong semaphore", "B",
                "A binary semaphore (mutex) has only two values, 0 and 1.", Difficulty.MEDIUM));
        list.add(createQ(c, "Requiring a process to request all of its resources at once eliminates which deadlock condition?", "Mutual Exclusion", "Hold and Wait", "No Preemption", "Circular Wait", "B",
                "Acquiring everything up front removes 'Hold and Wait'.", Difficulty.MEDIUM));
        list.add(createQ(c, "Peterson's solution is a classic software-based solution for which problem?", "Deadlock detection", "The critical-section problem", "Page replacement", "CPU scheduling", "B",
                "Peterson's algorithm provides mutual exclusion for two processes, solving the critical-section problem.", Difficulty.HARD));
        return list;
    }

    // ==========================================================================
    // DSA problems (canonical set, each with its practice link)
    // ==========================================================================

    private void ensureDsaProblems() {
        // Core set (also seeded by DataInitializer on a fresh DB — guarded so we never duplicate).
        ensureDsaProblem("Two Sum", "Arrays", Difficulty.EASY,
                "https://leetcode.com/problems/two-sum/",
                "Given an array of integers nums and an integer target, return indices of the two numbers that add up to target.",
                "Hash Table, Array");
        ensureDsaProblem("Best Time to Buy and Sell Stock", "Arrays", Difficulty.EASY,
                "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/",
                "Maximize profit by choosing a day to buy and a later day to sell one stock.",
                "Array, Dynamic Programming");
        ensureDsaProblem("3Sum", "Arrays", Difficulty.MEDIUM,
                "https://leetcode.com/problems/3sum/",
                "Return all unique triplets in the array that sum to zero.",
                "Array, Two Pointers, Sorting");
        ensureDsaProblem("Trapping Rain Water", "Arrays", Difficulty.HARD,
                "https://leetcode.com/problems/trapping-rain-water/",
                "Given an elevation map, compute how much water can be trapped after raining.",
                "Array, Two Pointers, Stack");
        ensureDsaProblem("Valid Palindrome", "Strings", Difficulty.EASY,
                "https://leetcode.com/problems/valid-palindrome/",
                "Determine whether a string is a palindrome, considering only alphanumeric characters and ignoring case.",
                "Two Pointers, String");
        ensureDsaProblem("Longest Substring Without Repeating Characters", "Strings", Difficulty.MEDIUM,
                "https://leetcode.com/problems/longest-substring-without-repeating-characters/",
                "Find the length of the longest substring without repeating characters.",
                "Hash Table, Sliding Window, String");
        ensureDsaProblem("Reverse Linked List", "Linked Lists", Difficulty.EASY,
                "https://leetcode.com/problems/reverse-linked-list/",
                "Reverse a singly linked list and return the new head.",
                "Linked List, Recursion");
        ensureDsaProblem("Merge Two Sorted Lists", "Linked Lists", Difficulty.EASY,
                "https://leetcode.com/problems/merge-two-sorted-lists/",
                "Merge two sorted linked lists into one sorted list.",
                "Linked List, Recursion");
        ensureDsaProblem("Binary Search", "Binary Search", Difficulty.EASY,
                "https://leetcode.com/problems/binary-search/",
                "Search a target in a sorted array in O(log n) time.",
                "Array, Binary Search");
        ensureDsaProblem("Search in Rotated Sorted Array", "Binary Search", Difficulty.MEDIUM,
                "https://leetcode.com/problems/search-in-rotated-sorted-array/",
                "Find the index of a target in a rotated sorted array, or -1 if absent.",
                "Array, Binary Search");
        ensureDsaProblem("Maximum Depth of Binary Tree", "Trees", Difficulty.EASY,
                "https://leetcode.com/problems/maximum-depth-of-binary-tree/",
                "Return the maximum depth of a binary tree.",
                "Tree, Depth-First Search, Breadth-First Search");
        ensureDsaProblem("Climbing Stairs", "Dynamic Programming", Difficulty.EASY,
                "https://leetcode.com/problems/climbing-stairs/",
                "Count the distinct ways to climb n stairs taking 1 or 2 steps at a time.",
                "Dynamic Programming, Memoization");
        ensureDsaProblem("Coin Change", "Dynamic Programming", Difficulty.MEDIUM,
                "https://leetcode.com/problems/coin-change/",
                "Return the fewest number of coins needed to make up a given amount.",
                "Array, Dynamic Programming, BFS");

        // Extra topics so every major DSA area has at least one problem with a link.
        ensureDsaProblem("Valid Parentheses", "Stack", Difficulty.EASY,
                "https://leetcode.com/problems/valid-parentheses/",
                "Determine if the input string of brackets is valid (correctly opened and closed).",
                "String, Stack");
        ensureDsaProblem("Min Stack", "Stack", Difficulty.MEDIUM,
                "https://leetcode.com/problems/min-stack/",
                "Design a stack that supports push, pop, top, and retrieving the minimum in constant time.",
                "Stack, Design");
        ensureDsaProblem("Number of Islands", "Graphs", Difficulty.MEDIUM,
                "https://leetcode.com/problems/number-of-islands/",
                "Count the number of islands in a 2D grid of '1' (land) and '0' (water).",
                "Graph, DFS, BFS, Union Find");
        ensureDsaProblem("Course Schedule", "Graphs", Difficulty.MEDIUM,
                "https://leetcode.com/problems/course-schedule/",
                "Determine if you can finish all courses given their prerequisites (cycle detection).",
                "Graph, Topological Sort, DFS");
        ensureDsaProblem("Subsets", "Backtracking", Difficulty.MEDIUM,
                "https://leetcode.com/problems/subsets/",
                "Return all possible subsets (the power set) of a set of distinct integers.",
                "Array, Backtracking, Bit Manipulation");
        ensureDsaProblem("Kth Largest Element in an Array", "Heap", Difficulty.MEDIUM,
                "https://leetcode.com/problems/kth-largest-element-in-an-array/",
                "Find the kth largest element in an unsorted array.",
                "Array, Heap, Quickselect");
    }

    // ==========================================================================
    // Find-or-create + seeding helpers
    // ==========================================================================

    private Section findOrCreateSection(String code, String name, String description, String icon) {
        return sectionRepository.findByCode(code).orElseGet(() -> {
            logger.info("Creating missing section '{}'.", code);
            return sectionRepository.save(Section.builder()
                    .name(name).code(code).description(description).icon(icon).build());
        });
    }

    private Subject findOrCreateSubject(Section section, String name, String code) {
        return subjectRepository.findBySectionIdAndNameIgnoreCase(section.getId(), name).orElseGet(() -> {
            logger.info("Creating missing subject '{}' under section '{}'.", name, section.getCode());
            return subjectRepository.save(Subject.builder()
                    .section(section).name(name).code(code).build());
        });
    }

    private Chapter findOrCreateChapter(Subject subject, String name, String description, int minutes) {
        return chapterRepository.findBySubjectIdAndNameIgnoreCase(subject.getId(), name).orElseGet(() -> {
            logger.info("Creating chapter '{}' under subject '{}'.", name, subject.getName());
            return chapterRepository.save(Chapter.builder()
                    .subject(subject).name(name).description(description).estimatedMinutes(minutes).build());
        });
    }

    /** Insert the given questions only if the chapter currently has none — keeps this idempotent. */
    private void seedIfEmpty(Chapter chapter, List<Question> questions) {
        if (questionRepository.countByChapterId(chapter.getId()) == 0) {
            questionRepository.saveAll(questions);
            logger.info("Initialized empty chapter '{}' with {} question(s).", chapter.getName(), questions.size());
        }
    }

    private void ensureDsaProblem(String title, String topic, Difficulty difficulty,
                                  String url, String description, String tags) {
        if (!dsaProblemRepository.existsByTitleIgnoreCase(title)) {
            dsaProblemRepository.save(DsaProblem.builder()
                    .title(title)
                    .topic(topic)
                    .difficulty(difficulty)
                    .platform("LeetCode")
                    .problemUrl(url)
                    .description(description)
                    .tags(tags)
                    .build());
            logger.info("Seeded DSA problem '{}'.", title);
        }
    }

    private Question createQ(Chapter chapter, String text, String a, String b, String c, String d,
                             String correct, String exp, Difficulty diff) {
        return Question.builder()
                .chapter(chapter)
                .questionText(text)
                .optionA(a)
                .optionB(b)
                .optionC(c)
                .optionD(d)
                .correctOption(correct)
                .explanation(exp)
                .difficulty(diff)
                .estimatedTimeSeconds(30)
                .build();
    }
}
