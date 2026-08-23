package com.placementprep.config;

import com.placementprep.entity.*;
import com.placementprep.repository.*;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Component
@Order(1) // must run before CurriculumSeeder, which augments the base data this seeds
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final SectionRepository sectionRepository;
    private final SubjectRepository subjectRepository;
    private final ChapterRepository chapterRepository;
    private final QuestionRepository questionRepository;
    private final DsaProblemRepository dsaProblemRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() == 0) {
            logger.info("Seeding initial users, sections, subjects, chapters, questions and DSA problems...");
            seedUsers();
            seedCurriculum();
            seedDsaProblems();
            logger.info("Data initialization complete!");
        }
    }

    private void seedUsers() {
        User admin = User.builder()
                .name("PlacementPrep Admin")
                .email("admin@placementprep.com")
                .password(passwordEncoder.encode("admin123"))
                .role(Role.ROLE_ADMIN)
                .college("IIT Delhi")
                .branch("Computer Science")
                .graduationYear(2025)
                .build();
        userRepository.save(admin);

        User student = User.builder()
                .name("Alex Student")
                .email("student@placementprep.com")
                .password(passwordEncoder.encode("student123"))
                .role(Role.ROLE_STUDENT)
                .college("BITS Pilani")
                .branch("Information Technology")
                .graduationYear(2026)
                .build();
        userRepository.save(student);
    }

    private void seedCurriculum() {
        // 1. SECTION: Aptitude
        Section aptitudeSection = Section.builder()
                .name("Aptitude")
                .code("APTITUDE")
                .description("Master Quantitative Aptitude, Logical Reasoning, and Verbal Ability with chapter-wise timed tests.")
                .icon("Calculator")
                .build();
        aptitudeSection = sectionRepository.save(aptitudeSection);

        // Subjects for Aptitude
        Subject quant = Subject.builder()
                .name("Quantitative Aptitude")
                .code("QUANT")
                .section(aptitudeSection)
                .build();
        quant = subjectRepository.save(quant);

        Subject lr = Subject.builder()
                .name("Logical Reasoning")
                .code("LR")
                .section(aptitudeSection)
                .build();
        lr = subjectRepository.save(lr);

        Subject verbal = Subject.builder()
                .name("Verbal Ability")
                .code("VERBAL")
                .section(aptitudeSection)
                .build();
        verbal = subjectRepository.save(verbal);

        // Chapters for Quant
        Chapter percentageChapter = Chapter.builder()
                .name("Percentage")
                .description("Understand fraction-to-percentage conversions, price-consumption variations, population growth, and successive percentage changes.")
                .estimatedMinutes(5)
                .subject(quant)
                .build();
        percentageChapter = chapterRepository.save(percentageChapter);

        Chapter profitLossChapter = Chapter.builder()
                .name("Profit and Loss")
                .description("Solve problems on Cost Price, Selling Price, Marked Price, Discount, Dishonest dealers, and successive discounts.")
                .estimatedMinutes(5)
                .subject(quant)
                .build();
        profitLossChapter = chapterRepository.save(profitLossChapter);

        Chapter timeWorkChapter = Chapter.builder()
                .name("Time and Work")
                .description("Master LCM efficiency method, alternate days working, wages distribution, and pipes & cisterns analogies.")
                .estimatedMinutes(5)
                .subject(quant)
                .build();
        timeWorkChapter = chapterRepository.save(timeWorkChapter);

        Chapter ratioChapter = Chapter.builder()
                .name("Ratio and Proportion")
                .description("Properties of ratios, mean proportions, partnership investments, and coin problems.")
                .estimatedMinutes(5)
                .subject(quant)
                .build();
        chapterRepository.save(ratioChapter);

        Chapter numberSystemChapter = Chapter.builder()
                .name("Number System")
                .description("Divisibility rules, unit digit calculation, remainders theorem, and factors.")
                .estimatedMinutes(5)
                .subject(quant)
                .build();
        chapterRepository.save(numberSystemChapter);

        // Chapters for LR
        Chapter codingDecoding = Chapter.builder()
                .name("Coding-Decoding")
                .description("Letter shifting, numerical substitutions, matrix codes, and pattern matching.")
                .estimatedMinutes(5)
                .subject(lr)
                .build();
        chapterRepository.save(codingDecoding);

        Chapter bloodRelations = Chapter.builder()
                .name("Blood Relations")
                .description("Family tree representation, coded relationships, and generational diagrams.")
                .estimatedMinutes(5)
                .subject(lr)
                .build();
        chapterRepository.save(bloodRelations);

        // Chapters for Verbal
        Chapter errorSpotting = Chapter.builder()
                .name("Error Spotting")
                .description("Subject-verb agreement, tenses, prepositions, modifiers, and idiomatic usages.")
                .estimatedMinutes(5)
                .subject(verbal)
                .build();
        chapterRepository.save(errorSpotting);

        // 2. SECTION: CS Fundamentals
        Section csSection = Section.builder()
                .name("CS Fundamentals")
                .code("CS_FUNDAMENTALS")
                .description("Strengthen core Computer Science subjects including OS, DBMS, Computer Networks, and OOP.")
                .icon("Cpu")
                .build();
        csSection = sectionRepository.save(csSection);

        Subject osSubject = Subject.builder()
                .name("Operating Systems")
                .code("OS")
                .section(csSection)
                .build();
        osSubject = subjectRepository.save(osSubject);

        Subject dbmsSubject = Subject.builder()
                .name("DBMS")
                .code("DBMS")
                .section(csSection)
                .build();
        dbmsSubject = subjectRepository.save(dbmsSubject);

        Subject cnSubject = Subject.builder()
                .name("Computer Networks")
                .code("CN")
                .section(csSection)
                .build();
        cnSubject = subjectRepository.save(cnSubject);

        Subject oopSubject = Subject.builder()
                .name("Object Oriented Programming")
                .code("OOP")
                .section(csSection)
                .build();
        oopSubject = subjectRepository.save(oopSubject);

        // OS Chapters
        Chapter cpuScheduling = Chapter.builder()
                .name("CPU Scheduling & Processes")
                .description("FCFS, SJF, Round Robin, Process State transitions, PCB, and Context Switching.")
                .estimatedMinutes(5)
                .subject(osSubject)
                .build();
        cpuScheduling = chapterRepository.save(cpuScheduling);

        Chapter deadlocks = Chapter.builder()
                .name("Deadlocks & Synchronization")
                .description("Coffman conditions, Banker's Algorithm, Mutex, Semaphores, and Peterson's solution.")
                .estimatedMinutes(5)
                .subject(osSubject)
                .build();
        chapterRepository.save(deadlocks);

        // DBMS Chapters
        Chapter normalization = Chapter.builder()
                .name("Normalization & ACID Properties")
                .description("1NF, 2NF, 3NF, BCNF, Functional Dependencies, Serializability, and Transactions.")
                .estimatedMinutes(5)
                .subject(dbmsSubject)
                .build();
        normalization = chapterRepository.save(normalization);

        // 3. SECTION: DSA
        Section dsaSection = Section.builder()
                .name("Data Structures & Algorithms")
                .code("DSA")
                .description("Practice curated coding problems categorized by topic and difficulty with direct status tracking.")
                .icon("Code")
                .build();
        sectionRepository.save(dsaSection);

        // Seed comprehensive questions for Percentage, Profit & Loss, Time & Work, CPU Scheduling, Normalization
        seedQuestionsForPercentage(percentageChapter);
        seedQuestionsForProfitLoss(profitLossChapter);
        seedQuestionsForTimeWork(timeWorkChapter);
        seedQuestionsForCpuScheduling(cpuScheduling);
        seedQuestionsForNormalization(normalization);
    }

    private void seedQuestionsForPercentage(Chapter chapter) {
        List<Question> list = new ArrayList<>();

        // EASY
        list.add(createQ(chapter, "What is 20% of 500?", "80", "100", "120", "150", "B", "20% of 500 = (20/100) * 500 = 100.", Difficulty.EASY));
        list.add(createQ(chapter, "If a student scores 45 out of 60 in a test, what is the percentage score?", "70%", "72.5%", "75%", "80%", "C", "Percentage = (45 / 60) * 100 = 0.75 * 100 = 75%.", Difficulty.EASY));
        list.add(createQ(chapter, "Convert the fraction 3/8 into percentage.", "37.5%", "35%", "32.5%", "40%", "A", "(3/8) * 100% = 37.5%.", Difficulty.EASY));
        list.add(createQ(chapter, "A number is increased from 80 to 100. What is the percentage increase?", "20%", "25%", "15%", "30%", "B", "Increase = 100 - 80 = 20. % Increase = (20 / 80) * 100 = 25%.", Difficulty.EASY));
        list.add(createQ(chapter, "What is 15% of 240?", "32", "36", "38", "40", "B", "15% of 240 = (15 / 100) * 240 = 36.", Difficulty.EASY));
        list.add(createQ(chapter, "If 30% of a number is 90, what is the number?", "270", "300", "320", "350", "B", "Let number be x. 0.3x = 90 => x = 90 / 0.3 = 300.", Difficulty.EASY));
        list.add(createQ(chapter, "In an exam, 40% is the passing mark. A student gets 185 marks and fails by 15 marks. What are the maximum marks?", "450", "500", "550", "600", "B", "Passing marks = 185 + 15 = 200. Since 40% = 200, Total marks = 200 / 0.40 = 500.", Difficulty.EASY));
        list.add(createQ(chapter, "What percentage of 2.5 kg is 250 grams?", "5%", "10%", "15%", "20%", "B", "2.5 kg = 2500 g. Percentage = (250 / 2500) * 100 = 10%.", Difficulty.EASY));

        // MEDIUM
        list.add(createQ(chapter, "If the price of sugar increases by 25%, by how much percent must a family reduce its consumption so that expenditure remains unchanged?", "15%", "20%", "25%", "30%", "B", "Reduction % = [r / (100 + r)] * 100 = [25 / 125] * 100 = 20%.", Difficulty.MEDIUM));
        list.add(createQ(chapter, "A's salary is 20% higher than B's salary. By what percentage is B's salary less than A's?", "16.67%", "20%", "25%", "18.5%", "A", "Difference = [20 / (100 + 20)] * 100 = 2000 / 120 = 16.67%.", Difficulty.MEDIUM));
        list.add(createQ(chapter, "A number is first increased by 20% and then decreased by 20%. What is the net percentage change in the number?", "No change", "4% increase", "4% decrease", "2% decrease", "C", "Net change = x + y + (xy/100) = 20 - 20 + ((20 * -20) / 100) = -4% (4% decrease).", Difficulty.MEDIUM));
        list.add(createQ(chapter, "The population of a town increases by 10% annually. If the present population is 20,000, what will it be after 2 years?", "24,000", "24,200", "22,200", "24,500", "B", "Population = 20000 * (1.10)^2 = 20000 * 1.21 = 24,200.", Difficulty.MEDIUM));
        list.add(createQ(chapter, "In a college, 60% of students are boys and the rest are girls. If 20% of boys and 25% of girls are scholarship holders, what percentage of students do NOT hold a scholarship?", "78%", "79%", "80%", "82%", "A", "Let total students = 100. Boys = 60, Girls = 40. Non-holders = (0.80 * 60) + (0.75 * 40) = 48 + 30 = 78%.", Difficulty.MEDIUM));
        list.add(createQ(chapter, "If 70% of students in a school are boys and the number of girls is 504, find the total number of students.", "1560", "1680", "1720", "1800", "B", "Girls % = 30%. 30% of Total = 504 => Total = 504 / 0.30 = 1680.", Difficulty.MEDIUM));

        // HARD
        list.add(createQ(chapter, "A fresh watermelon contains 90% water. After sitting in the sun for a few days, it contains 80% water and weighs 10 kg. What was its original weight?", "15 kg", "18 kg", "20 kg", "25 kg", "C", "Pulp remains constant: 20% of 10 kg = 2 kg. Originally, pulp was 10% of total weight. Total = 2 / 0.10 = 20 kg.", Difficulty.HARD));
        list.add(createQ(chapter, "In an election between two candidates, 10% of voters did not cast votes and 10% votes were declared invalid. The winning candidate got 54% of valid votes and won by 1620 votes. Find total enrolled voters.", "20,000", "22,500", "25,000", "30,000", "C", "Let total voters = 100x. Voted = 90x. Valid = 81x. Majority = (54% - 46%) of 81x = 8% of 81x = 6.48x. 6.48x = 1620 => x = 250 => Total = 25,000.", Difficulty.HARD));
        list.add(createQ(chapter, "Due to a 20% reduction in the price of wheat per kg, a person can buy 5 kg more wheat for Rs 600. What is the original price per kg?", "Rs 25", "Rs 30", "Rs 35", "Rs 40", "B", "Money saved = 20% of 600 = Rs 120. Reduced price = 120 / 5 = Rs 24/kg. Original price = 24 / 0.80 = Rs 30/kg.", Difficulty.HARD));
        list.add(createQ(chapter, "A candidate has to score 33% marks to pass. He gets 125 marks and fails by 40 marks. What are the maximum marks?", "450", "500", "550", "600", "B", "Passing marks = 125 + 40 = 165. 33% of Max = 165 => Max marks = 165 / 0.33 = 500.", Difficulty.HARD));

        questionRepository.saveAll(list);
    }

    private void seedQuestionsForProfitLoss(Chapter chapter) {
        List<Question> list = new ArrayList<>();

        // EASY
        list.add(createQ(chapter, "A man buys an article for Rs 300 and sells it for Rs 360. Find his profit percentage.", "15%", "18%", "20%", "25%", "C", "Profit = 360 - 300 = Rs 60. Profit % = (60 / 300) * 100 = 20%.", Difficulty.EASY));
        list.add(createQ(chapter, "A book bought for Rs 120 is sold at a loss of 10%. What is its selling price?", "Rs 100", "Rs 108", "Rs 110", "Rs 112", "B", "SP = CP * (1 - 0.10) = 120 * 0.90 = Rs 108.", Difficulty.EASY));
        list.add(createQ(chapter, "Find the cost price of an article sold for Rs 450 at a profit of 25%.", "Rs 350", "Rs 360", "Rs 375", "Rs 400", "B", "CP = SP / (1 + Profit%) = 450 / 1.25 = Rs 360.", Difficulty.EASY));
        list.add(createQ(chapter, "By selling a bicycle for Rs 2850, a shopkeeper gains 14%. What is the cost price?", "Rs 2400", "Rs 2500", "Rs 2600", "Rs 2700", "B", "CP = 2850 / 1.14 = Rs 2500.", Difficulty.EASY));
        list.add(createQ(chapter, "If the cost price of 6 items is equal to the selling price of 4 items, find the profit percentage.", "33.33%", "40%", "50%", "60%", "C", "6 CP = 4 SP => SP/CP = 6/4 = 3/2. Profit % = [(3 - 2) / 2] * 100 = 50%.", Difficulty.EASY));
        list.add(createQ(chapter, "A watch is sold at a loss of 5%. If SP is Rs 190, find CP.", "Rs 195", "Rs 200", "Rs 205", "Rs 210", "B", "CP = 190 / 0.95 = Rs 200.", Difficulty.EASY));

        // MEDIUM
        list.add(createQ(chapter, "A trader gives two successive discounts of 20% and 10% on a marked price of Rs 500. Find the selling price.", "Rs 350", "Rs 360", "Rs 375", "Rs 380", "B", "SP = 500 * (1 - 0.20) * (1 - 0.10) = 500 * 0.8 * 0.9 = 500 * 0.72 = Rs 360.", Difficulty.MEDIUM));
        list.add(createQ(chapter, "A person sells two chairs for Rs 1200 each. On one he gains 20% and on the other he loses 20%. What is his overall gain/loss %?", "No profit no loss", "2% loss", "4% loss", "4% gain", "C", "For equal SP with +x% and -x%, overall loss % = (x/10) ^ 2 = (20/10) ^ 2 = 4% loss.", Difficulty.MEDIUM));
        list.add(createQ(chapter, "A dishonest dealer professes to sell his goods at cost price but uses a weight of 900 grams for 1 kg. What is his gain percentage?", "10%", "11.11%", "12.5%", "15%", "B", "Gain % = [Error / (True value - Error)] * 100 = [100 / 900] * 100 = 11.11%.", Difficulty.MEDIUM));
        list.add(createQ(chapter, "By selling 33 meters of cloth, a shopkeeper gains the cost price of 11 meters. Find his gain percentage.", "25%", "33.33%", "40%", "50%", "B", "Gain = 11 CP. Gain % = (11 CP / 33 CP) * 100 = 33.33%.", Difficulty.MEDIUM));

        // HARD
        list.add(createQ(chapter, "A shopkeeper marks his goods at 40% above the cost price and allows a discount of 25% on the marked price. Find his net profit percentage.", "5%", "8%", "10%", "15%", "A", "Let CP = 100. MP = 140. SP = 140 * 0.75 = 105. Profit % = 105 - 100 = 5%.", Difficulty.HARD));
        list.add(createQ(chapter, "A trader sells an article at a profit of 20%. If he had bought it at 20% less and sold it for Rs 18 less, he would have gained 25%. Find the cost price.", "Rs 150", "Rs 175", "Rs 180", "Rs 200", "C", "Let CP = 100x => SP1 = 120x. New CP = 80x. New SP = 80x * 1.25 = 100x. Difference = 120x - 100x = 20x = 18 => x = 0.9. CP = 100 * 0.9 = Rs 180.", Difficulty.HARD));
        list.add(createQ(chapter, "A man buys two horses for Rs 40,000. He sells one at 15% profit and other at 10% loss, making no profit or loss on the whole transaction. Find the cost of the first horse.", "Rs 15,000", "Rs 16,000", "Rs 18,000", "Rs 20,000", "B", "15% of H1 = 10% of H2 => H1/H2 = 10/15 = 2/3. Cost of H1 = (2/5) * 40,000 = Rs 16,000.", Difficulty.HARD));

        questionRepository.saveAll(list);
    }

    private void seedQuestionsForTimeWork(Chapter chapter) {
        List<Question> list = new ArrayList<>();

        // EASY
        list.add(createQ(chapter, "A can do a piece of work in 10 days and B can do it in 15 days. In how many days can they complete it working together?", "4 days", "5 days", "6 days", "7.5 days", "C", "Total work = LCM(10, 15) = 30 units. Efficiency of A = 3, B = 2. Together = 30 / (3 + 2) = 6 days.", Difficulty.EASY));
        list.add(createQ(chapter, "If 12 men can complete a project in 20 days, in how many days can 15 men complete the same project?", "14 days", "15 days", "16 days", "18 days", "C", "M1 * D1 = M2 * D2 => 12 * 20 = 15 * D2 => D2 = 240 / 15 = 16 days.", Difficulty.EASY));
        list.add(createQ(chapter, "A alone can complete a work in 12 days and A with B can complete it in 8 days. How long will B alone take?", "20 days", "22 days", "24 days", "28 days", "C", "Work = 24. A eff = 2, (A+B) eff = 3 => B eff = 1. B time = 24 / 1 = 24 days.", Difficulty.EASY));
        list.add(createQ(chapter, "A is twice as good a workman as B. Together they finish a work in 14 days. In how many days can A alone finish it?", "18 days", "21 days", "24 days", "28 days", "B", "Ratio of eff A:B = 2:1. Total eff = 3. Total work = 3 * 14 = 42 units. A alone = 42 / 2 = 21 days.", Difficulty.EASY));
        list.add(createQ(chapter, "Pipe A can fill a tank in 4 hours and Pipe B can fill it in 6 hours. If opened together, how long will it take?", "2.4 hours", "2.5 hours", "3 hours", "3.2 hours", "A", "Work = 12. A eff = 3, B eff = 2. Time = 12 / 5 = 2.4 hours (2 hours 24 mins).", Difficulty.EASY));

        // MEDIUM
        list.add(createQ(chapter, "A can do a work in 16 days and B in 12 days. They worked together for 4 days and then A left. In how many more days will B finish the remaining work?", "4 days", "5 days", "6 days", "7 days", "B", "Work = 48. A eff = 3, B eff = 4. 4 days work = 4 * 7 = 28 units. Remaining = 48 - 28 = 20 units. B time = 20 / 4 = 5 days.", Difficulty.MEDIUM));
        list.add(createQ(chapter, "A, B, and C can complete a work in 10, 12, and 15 days respectively. If they start together, in how many days is the work finished?", "3.5 days", "4 days", "4.5 days", "5 days", "B", "Work = 60. Eff A=6, B=5, C=4. Total eff = 15. Time = 60 / 15 = 4 days.", Difficulty.MEDIUM));
        list.add(createQ(chapter, "A and B can do a work in 12 days, B and C in 15 days, C and A in 20 days. How long will A alone take?", "24 days", "30 days", "36 days", "40 days", "B", "2(A+B+C) eff = 5 + 4 + 3 = 12 => A+B+C eff = 6. A eff = (A+B+C) - (B+C) = 6 - 4 = 2. Time for A = 60 / 2 = 30 days.", Difficulty.MEDIUM));
        list.add(createQ(chapter, "Pipe A fills a tank in 10 hrs, Pipe B empties it in 15 hrs. If both are open, how long will it take to fill the tank?", "25 hrs", "30 hrs", "35 hrs", "40 hrs", "B", "Tank = 30. A eff = +3, B eff = -2. Net eff = 1. Time = 30 / 1 = 30 hrs.", Difficulty.MEDIUM));

        // HARD
        list.add(createQ(chapter, "A, B and C can do a work in 20, 30 and 60 days. A is assisted by B and C on every third day. How long will the work take?", "12 days", "15 days", "16 days", "18 days", "B", "Work = 60. Eff A=3, B=2, C=1. Day 1: A(3), Day 2: A(3), Day 3: A+B+C(6). 3-day work = 12 units. 60 units take (60/12)*3 = 15 days.", Difficulty.HARD));
        list.add(createQ(chapter, "3 men or 5 women can do a piece of work in 43 days. In how many days can 4 men and 6 women do the same work?", "12 days", "15 days", "18 days", "20 days", "B", "3M = 5W => 1M = 5/3 W. 4M + 6W = 4(5/3)W + 6W = 38/3 W. D = (5 * 43) / (38/3) = (215 * 3) / 43 = 15 days.", Difficulty.HARD));

        questionRepository.saveAll(list);
    }

    private void seedQuestionsForCpuScheduling(Chapter chapter) {
        List<Question> list = new ArrayList<>();
        list.add(createQ(chapter, "Which CPU scheduling algorithm may suffer from the 'Convoy Effect'?", "Round Robin", "First-Come First-Served (FCFS)", "Shortest Job First (SJF)", "Priority Scheduling", "B", "FCFS suffers from the Convoy Effect where small processes wait behind a long CPU-intensive process.", Difficulty.EASY));
        list.add(createQ(chapter, "Which scheduling algorithm is optimal in terms of minimizing average waiting time?", "Round Robin", "Non-preemptive Priority", "Shortest Remaining Time First (SRTF)", "FCFS", "C", "SRTF (preemptive SJF) provably gives the minimum average waiting time for a given set of processes.", Difficulty.MEDIUM));
        list.add(createQ(chapter, "What happens in Round Robin scheduling if the time quantum is extremely large?", "It behaves like Priority Scheduling", "It behaves like FCFS", "It causes deadlock", "Context switching overhead increases infinitely", "B", "When time quantum is greater than max burst time, every process runs to completion on first dispatch, behaving exactly like FCFS.", Difficulty.MEDIUM));
        list.add(createQ(chapter, "Aging is a technique used in operating systems to prevent which issue?", "Deadlock", "Thrashing", "Starvation", "Race conditions", "C", "Aging gradually increases the priority of processes that wait in the system for a long time, preventing starvation.", Difficulty.HARD));
        questionRepository.saveAll(list);
    }

    private void seedQuestionsForNormalization(Chapter chapter) {
        List<Question> list = new ArrayList<>();
        list.add(createQ(chapter, "Which normal form requires eliminating repeating groups and ensuring atomic attribute values?", "1NF", "2NF", "3NF", "BCNF", "A", "1NF (First Normal Form) requires that every attribute contains only atomic (indivisible) values.", Difficulty.EASY));
        list.add(createQ(chapter, "A relation is in 2NF if it is in 1NF and contains no:", "Transitive dependencies", "Partial dependencies on a candidate key", "Multivalued dependencies", "Join dependencies", "B", "2NF eliminates partial dependencies, meaning every non-prime attribute must be fully functionally dependent on the entire primary key.", Difficulty.MEDIUM));
        list.add(createQ(chapter, "In which normal form must every functional dependency X -> Y satisfy the condition that X is a superkey?", "2NF", "3NF", "Boyce-Codd Normal Form (BCNF)", "4NF", "C", "BCNF is a stricter version of 3NF where for every non-trivial functional dependency X -> Y, X must be a super key.", Difficulty.HARD));
        questionRepository.saveAll(list);
    }

    private void seedDsaProblems() {
        List<DsaProblem> list = new ArrayList<>();

        list.add(DsaProblem.builder()
                .title("Two Sum")
                .topic("Arrays")
                .difficulty(Difficulty.EASY)
                .platform("LeetCode")
                .problemUrl("https://leetcode.com/problems/two-sum/")
                .description("Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.")
                .tags("Hash Table, Array")
                .build());

        list.add(DsaProblem.builder()
                .title("Best Time to Buy and Sell Stock")
                .topic("Arrays")
                .difficulty(Difficulty.EASY)
                .platform("LeetCode")
                .problemUrl("https://leetcode.com/problems/best-time-to-buy-and-sell-stock/")
                .description("Maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.")
                .tags("Array, Dynamic Programming")
                .build());

        list.add(DsaProblem.builder()
                .title("3Sum")
                .topic("Arrays")
                .difficulty(Difficulty.MEDIUM)
                .platform("LeetCode")
                .problemUrl("https://leetcode.com/problems/3sum/")
                .description("Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0.")
                .tags("Array, Two Pointers, Sorting")
                .build());

        list.add(DsaProblem.builder()
                .title("Trapping Rain Water")
                .topic("Arrays")
                .difficulty(Difficulty.HARD)
                .platform("LeetCode")
                .problemUrl("https://leetcode.com/problems/trapping-rain-water/")
                .description("Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.")
                .tags("Array, Two Pointers, Stack")
                .build());

        list.add(DsaProblem.builder()
                .title("Valid Palindrome")
                .topic("Strings")
                .difficulty(Difficulty.EASY)
                .platform("LeetCode")
                .problemUrl("https://leetcode.com/problems/valid-palindrome/")
                .description("A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.")
                .tags("Two Pointers, String")
                .build());

        list.add(DsaProblem.builder()
                .title("Longest Substring Without Repeating Characters")
                .topic("Strings")
                .difficulty(Difficulty.MEDIUM)
                .platform("LeetCode")
                .problemUrl("https://leetcode.com/problems/longest-substring-without-repeating-characters/")
                .description("Given a string s, find the length of the longest substring without repeating characters.")
                .tags("Hash Table, Sliding Window, String")
                .build());

        list.add(DsaProblem.builder()
                .title("Reverse Linked List")
                .topic("Linked Lists")
                .difficulty(Difficulty.EASY)
                .platform("LeetCode")
                .problemUrl("https://leetcode.com/problems/reverse-linked-list/")
                .description("Given the head of a singly linked list, reverse the list, and return the reversed list.")
                .tags("Linked List, Recursion")
                .build());

        list.add(DsaProblem.builder()
                .title("Merge Two Sorted Lists")
                .topic("Linked Lists")
                .difficulty(Difficulty.EASY)
                .platform("LeetCode")
                .problemUrl("https://leetcode.com/problems/merge-two-sorted-lists/")
                .description("Merge two sorted linked lists into one sorted list.")
                .tags("Linked List, Recursion")
                .build());

        list.add(DsaProblem.builder()
                .title("Binary Search")
                .topic("Binary Search")
                .difficulty(Difficulty.EASY)
                .platform("LeetCode")
                .problemUrl("https://leetcode.com/problems/binary-search/")
                .description("Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums.")
                .tags("Array, Binary Search")
                .build());

        list.add(DsaProblem.builder()
                .title("Search in Rotated Sorted Array")
                .topic("Binary Search")
                .difficulty(Difficulty.MEDIUM)
                .platform("LeetCode")
                .problemUrl("https://leetcode.com/problems/search-in-rotated-sorted-array/")
                .description("Given the array nums after possible rotation and an integer target, return the index of target if it is in nums, or -1.")
                .tags("Array, Binary Search")
                .build());

        list.add(DsaProblem.builder()
                .title("Maximum Depth of Binary Tree")
                .topic("Trees")
                .difficulty(Difficulty.EASY)
                .platform("LeetCode")
                .problemUrl("https://leetcode.com/problems/maximum-depth-of-binary-tree/")
                .description("Given the root of a binary tree, return its maximum depth.")
                .tags("Tree, Depth-First Search, Breadth-First Search")
                .build());

        list.add(DsaProblem.builder()
                .title("Climbing Stairs")
                .topic("Dynamic Programming")
                .difficulty(Difficulty.EASY)
                .platform("LeetCode")
                .problemUrl("https://leetcode.com/problems/climbing-stairs/")
                .description("You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?")
                .tags("Dynamic Programming, Memoization")
                .build());

        list.add(DsaProblem.builder()
                .title("Coin Change")
                .topic("Dynamic Programming")
                .difficulty(Difficulty.MEDIUM)
                .platform("LeetCode")
                .problemUrl("https://leetcode.com/problems/coin-change/")
                .description("You are given an integer array coins representing coins of different denominations and an integer amount. Return the fewest number of coins that you need to make up that amount.")
                .tags("Array, Dynamic Programming, BFS")
                .build());

        dsaProblemRepository.saveAll(list);
    }

    private Question createQ(Chapter chapter, String text, String a, String b, String c, String d, String correct, String exp, Difficulty diff) {
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
