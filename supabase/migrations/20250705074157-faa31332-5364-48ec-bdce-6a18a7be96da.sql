-- Insert 100 new feedback entries for July 2025
INSERT INTO feedback (
    course_offering_id,
    category_id,
    status_id,
    overall_rating,
    teaching_effectiveness,
    course_content,
    communication,
    availability,
    positive_feedback,
    improvement_suggestions,
    additional_comments,
    is_anonymous,
    created_at,
    updated_at
) VALUES
-- Batch 1: Course Evaluation feedback (10 entries)
('83303330-c144-4af9-93bd-f5038987397c', 1, 1, 5, 5, 4, 5, 4, 'Excellent teaching style and very clear explanations', 'Maybe add more practical examples', 'Overall great experience', true, '2025-07-01 09:00:00+00', '2025-07-01 09:00:00+00'),
('8edfe20f-da7c-4ac7-91a7-28367bd21341', 1, 1, 4, 4, 4, 3, 4, 'Good course structure and content', 'Could improve communication during lectures', NULL, true, '2025-07-01 10:30:00+00', '2025-07-01 10:30:00+00'),
('e56e5cd5-4cfa-4fd5-bf60-105b1f63b13b', 1, 1, 3, 3, 3, 4, 3, 'Average teaching quality', 'More interactive sessions would help', 'Course is okay but could be better', false, '2025-07-01 14:20:00+00', '2025-07-01 14:20:00+00'),
('ed9304c3-963b-4b98-85c9-a5ce67e9187d', 1, 1, 5, 5, 5, 5, 5, 'Outstanding lecturer with deep knowledge', 'Keep up the excellent work', 'Best course I have taken', true, '2025-07-02 08:15:00+00', '2025-07-02 08:15:00+00'),
('7a1ace4d-0f8b-4180-bc3b-eb50719ab757', 1, 1, 2, 2, 3, 2, 2, 'Course content needs improvement', 'More preparation before lectures needed', 'Disappointing experience', true, '2025-07-02 11:45:00+00', '2025-07-02 11:45:00+00'),
('e95f3a92-8645-4d08-9a63-f158b77f68f9', 1, 1, 4, 4, 4, 4, 3, 'Good teaching methodology', 'Office hours could be extended', NULL, false, '2025-07-02 16:30:00+00', '2025-07-02 16:30:00+00'),
('c106b528-577d-4dc7-99bd-042fed922deb', 1, 1, 3, 4, 3, 3, 4, 'Decent course overall', 'Add more case studies', 'Satisfied with the learning', true, '2025-07-03 09:20:00+00', '2025-07-03 09:20:00+00'),
('48509e62-c4ac-4cc9-a1d4-afa2bafe3c03', 1, 1, 5, 4, 5, 4, 4, 'Comprehensive coverage of topics', 'Nothing major to improve', 'Highly recommend this course', true, '2025-07-03 13:10:00+00', '2025-07-03 13:10:00+00'),
('0b45f575-98b1-46ba-a029-d0c3abd106b4', 1, 1, 4, 3, 4, 4, 4, 'Well structured content', 'More visual aids would help', NULL, false, '2025-07-03 15:40:00+00', '2025-07-03 15:40:00+00'),
('65f0337d-8e6e-4b90-a48a-5e13ff7a6132', 1, 1, 4, 4, 3, 4, 5, 'Engaging lectures', 'Course materials could be updated', 'Good learning environment', true, '2025-07-04 10:00:00+00', '2025-07-04 10:00:00+00'),

-- Batch 2: Teaching Methods feedback (15 entries)
('83303330-c144-4af9-93bd-f5038987397c', 2, 1, 4, 5, 4, 4, 3, 'Innovative teaching approaches', 'More group activities needed', NULL, true, '2025-07-04 14:25:00+00', '2025-07-04 14:25:00+00'),
('8edfe20f-da7c-4ac7-91a7-28367bd21341', 2, 1, 3, 3, 3, 3, 3, 'Traditional methods work fine', 'Try incorporating technology', 'Standard teaching approach', false, '2025-07-05 08:30:00+00', '2025-07-05 08:30:00+00'),
('e56e5cd5-4cfa-4fd5-bf60-105b1f63b13b', 2, 1, 5, 5, 4, 5, 4, 'Excellent use of multimedia', 'Perfect teaching style', 'Very engaging classes', true, '2025-07-05 11:15:00+00', '2025-07-05 11:15:00+00'),
('ed9304c3-963b-4b98-85c9-a5ce67e9187d', 2, 1, 2, 2, 2, 3, 2, 'Outdated teaching methods', 'Need to modernize approach', 'Boring lectures', true, '2025-07-05 16:20:00+00', '2025-07-05 16:20:00+00'),
('7a1ace4d-0f8b-4180-bc3b-eb50719ab757', 2, 1, 4, 4, 4, 3, 4, 'Good mix of theory and practice', 'More hands-on activities', NULL, false, '2025-07-06 09:45:00+00', '2025-07-06 09:45:00+00'),
('e95f3a92-8645-4d08-9a63-f158b77f68f9', 2, 1, 3, 3, 4, 3, 3, 'Adequate teaching methods', 'Could be more interactive', 'Average experience', true, '2025-07-06 12:30:00+00', '2025-07-06 12:30:00+00'),
('c106b528-577d-4dc7-99bd-042fed922deb', 2, 1, 5, 5, 5, 4, 5, 'Creative and engaging methods', 'Keep using current approach', 'Love the teaching style', true, '2025-07-06 15:50:00+00', '2025-07-06 15:50:00+00'),
('48509e62-c4ac-4cc9-a1d4-afa2bafe3c03', 2, 1, 4, 4, 3, 4, 4, 'Well-planned lessons', 'Add more real-world examples', NULL, false, '2025-07-07 08:20:00+00', '2025-07-07 08:20:00+00'),
('0b45f575-98b1-46ba-a029-d0c3abd106b4', 2, 1, 3, 4, 3, 3, 3, 'Decent teaching approach', 'More student participation', 'Room for improvement', true, '2025-07-07 13:40:00+00', '2025-07-07 13:40:00+00'),
('65f0337d-8e6e-4b90-a48a-5e13ff7a6132', 2, 1, 4, 4, 4, 4, 3, 'Effective teaching methods', 'Continue current practices', NULL, true, '2025-07-07 17:10:00+00', '2025-07-07 17:10:00+00'),
('83303330-c144-4af9-93bd-f5038987397c', 2, 1, 5, 4, 5, 5, 4, 'Exceptional delivery style', 'Maybe slow down a bit', 'Fantastic teacher', false, '2025-07-08 09:00:00+00', '2025-07-08 09:00:00+00'),
('8edfe20f-da7c-4ac7-91a7-28367bd21341', 2, 1, 2, 3, 2, 2, 3, 'Methods need improvement', 'More engaging techniques needed', 'Struggling to follow', true, '2025-07-08 11:25:00+00', '2025-07-08 11:25:00+00'),
('e56e5cd5-4cfa-4fd5-bf60-105b1f63b13b', 2, 1, 4, 3, 4, 4, 4, 'Good overall approach', 'Fine-tune presentation skills', NULL, true, '2025-07-08 14:55:00+00', '2025-07-08 14:55:00+00'),
('ed9304c3-963b-4b98-85c9-a5ce67e9187d', 2, 1, 3, 3, 3, 4, 3, 'Standard teaching quality', 'More variety in methods', 'Satisfactory', false, '2025-07-09 10:15:00+00', '2025-07-09 10:15:00+00'),
('7a1ace4d-0f8b-4180-bc3b-eb50719ab757', 2, 1, 5, 5, 4, 5, 5, 'Outstanding methodology', 'Perfect as is', 'Excellent experience', true, '2025-07-09 16:30:00+00', '2025-07-09 16:30:00+00'),

-- Batch 3: Course Content feedback (15 entries)
('e95f3a92-8645-4d08-9a63-f158b77f68f9', 3, 1, 4, 3, 5, 4, 3, 'Comprehensive and up-to-date content', 'More practical applications', NULL, true, '2025-07-10 08:45:00+00', '2025-07-10 08:45:00+00'),
('c106b528-577d-4dc7-99bd-042fed922deb', 3, 1, 3, 4, 3, 3, 4, 'Content is relevant', 'Need more detailed explanations', 'Good coverage of topics', false, '2025-07-10 12:20:00+00', '2025-07-10 12:20:00+00'),
('48509e62-c4ac-4cc9-a1d4-afa2bafe3c03', 3, 1, 5, 4, 5, 4, 4, 'Excellent course materials', 'Keep current content quality', 'Very informative', true, '2025-07-10 15:10:00+00', '2025-07-10 15:10:00+00'),
('0b45f575-98b1-46ba-a029-d0c3abd106b4', 3, 1, 2, 3, 2, 3, 2, 'Content seems outdated', 'Update curriculum urgently', 'Not meeting expectations', true, '2025-07-11 09:30:00+00', '2025-07-11 09:30:00+00'),
('65f0337d-8e6e-4b90-a48a-5e13ff7a6132', 3, 1, 4, 4, 4, 3, 4, 'Well-structured content', 'Add more examples', NULL, false, '2025-07-11 13:45:00+00', '2025-07-11 13:45:00+00'),
('83303330-c144-4af9-93bd-f5038987397c', 3, 1, 3, 3, 4, 3, 3, 'Content is acceptable', 'More interactive materials needed', 'Average quality', true, '2025-07-11 17:20:00+00', '2025-07-11 17:20:00+00'),
('8edfe20f-da7c-4ac7-91a7-28367bd21341', 3, 1, 5, 4, 5, 5, 4, 'Outstanding content quality', 'Maybe add more advanced topics', 'Exceeded expectations', true, '2025-07-12 08:15:00+00', '2025-07-12 08:15:00+00'),
('e56e5cd5-4cfa-4fd5-bf60-105b1f63b13b', 3, 1, 4, 4, 3, 4, 4, 'Good content depth', 'Could improve organization', NULL, false, '2025-07-12 11:40:00+00', '2025-07-12 11:40:00+00'),
('ed9304c3-963b-4b98-85c9-a5ce67e9187d', 3, 1, 2, 2, 3, 2, 3, 'Content lacks depth', 'Need comprehensive revision', 'Disappointing material', true, '2025-07-12 14:25:00+00', '2025-07-12 14:25:00+00'),
('7a1ace4d-0f8b-4180-bc3b-eb50719ab757', 3, 1, 4, 3, 4, 4, 3, 'Relevant and useful content', 'More case studies would help', NULL, true, '2025-07-13 09:50:00+00', '2025-07-13 09:50:00+00'),
('e95f3a92-8645-4d08-9a63-f158b77f68f9', 3, 1, 5, 5, 5, 4, 5, 'Exceptional course content', 'Perfect balance of theory/practice', 'Highly valuable', false, '2025-07-13 12:35:00+00', '2025-07-13 12:35:00+00'),
('c106b528-577d-4dc7-99bd-042fed922deb', 3, 1, 3, 3, 3, 3, 3, 'Standard content quality', 'Could be more engaging', 'Meets basic requirements', true, '2025-07-13 16:00:00+00', '2025-07-13 16:00:00+00'),
('48509e62-c4ac-4cc9-a1d4-afa2bafe3c03', 3, 1, 4, 4, 4, 3, 4, 'Well-prepared materials', 'Add multimedia elements', NULL, true, '2025-07-14 10:20:00+00', '2025-07-14 10:20:00+00'),
('0b45f575-98b1-46ba-a029-d0c3abd106b4', 3, 1, 3, 4, 3, 4, 3, 'Content is informative', 'Better sequencing needed', 'Good learning material', false, '2025-07-14 14:15:00+00', '2025-07-14 14:15:00+00'),
('65f0337d-8e6e-4b90-a48a-5e13ff7a6132', 3, 1, 5, 4, 5, 5, 4, 'Excellent content delivery', 'Continue high standards', 'Very satisfied', true, '2025-07-14 17:45:00+00', '2025-07-14 17:45:00+00'),

-- Batch 4: Assessment feedback (15 entries)
('83303330-c144-4af9-93bd-f5038987397c', 4, 1, 4, 4, 4, 3, 4, 'Fair assessment methods', 'More frequent quizzes would help', NULL, true, '2025-07-15 08:30:00+00', '2025-07-15 08:30:00+00'),
('8edfe20f-da7c-4ac7-91a7-28367bd21341', 4, 1, 3, 3, 3, 4, 3, 'Assessment is reasonable', 'Clearer rubrics needed', 'Standard evaluation', false, '2025-07-15 11:50:00+00', '2025-07-15 11:50:00+00'),
('e56e5cd5-4cfa-4fd5-bf60-105b1f63b13b', 4, 1, 5, 4, 5, 4, 5, 'Excellent assessment structure', 'Keep current approach', 'Very fair evaluation', true, '2025-07-15 15:20:00+00', '2025-07-15 15:20:00+00'),
('ed9304c3-963b-4b98-85c9-a5ce67e9187d', 4, 1, 2, 2, 3, 2, 2, 'Assessment too difficult', 'Make exams more reasonable', 'Struggling with evaluations', true, '2025-07-16 09:15:00+00', '2025-07-16 09:15:00+00'),
('7a1ace4d-0f8b-4180-bc3b-eb50719ab757', 4, 1, 4, 3, 4, 4, 3, 'Good assessment balance', 'More practice tests needed', NULL, false, '2025-07-16 12:40:00+00', '2025-07-16 12:40:00+00'),
('e95f3a92-8645-4d08-9a63-f158b77f68f9', 4, 1, 3, 4, 3, 3, 4, 'Assessment methods are okay', 'Provide sample questions', 'Average difficulty level', true, '2025-07-16 16:10:00+00', '2025-07-16 16:10:00+00'),
('c106b528-577d-4dc7-99bd-042fed922deb', 4, 1, 5, 5, 4, 5, 4, 'Outstanding assessment design', 'Perfect evaluation system', 'Very well organized', true, '2025-07-17 08:25:00+00', '2025-07-17 08:25:00+00'),
('48509e62-c4ac-4cc9-a1d4-afa2bafe3c03', 4, 1, 4, 4, 4, 3, 4, 'Well-designed assessments', 'Add more project-based evaluation', NULL, false, '2025-07-17 13:30:00+00', '2025-07-17 13:30:00+00'),
('0b45f575-98b1-46ba-a029-d0c3abd106b4', 4, 1, 3, 3, 3, 3, 3, 'Assessment is fair enough', 'More variety in question types', 'Satisfactory evaluation', true, '2025-07-17 17:00:00+00', '2025-07-17 17:00:00+00'),
('65f0337d-8e6e-4b90-a48a-5e13ff7a6132', 4, 1, 4, 4, 3, 4, 4, 'Good assessment practices', 'Feedback on exams could be faster', NULL, true, '2025-07-18 10:45:00+00', '2025-07-18 10:45:00+00'),
('83303330-c144-4af9-93bd-f5038987397c', 4, 1, 5, 4, 5, 4, 5, 'Excellent evaluation methods', 'Continue current standards', 'Very impressed', false, '2025-07-18 14:20:00+00', '2025-07-18 14:20:00+00'),
('8edfe20f-da7c-4ac7-91a7-28367bd21341', 4, 1, 2, 3, 2, 2, 3, 'Assessment needs improvement', 'Make instructions clearer', 'Confusing evaluation process', true, '2025-07-18 16:55:00+00', '2025-07-18 16:55:00+00'),
('e56e5cd5-4cfa-4fd5-bf60-105b1f63b13b', 4, 1, 4, 3, 4, 4, 3, 'Assessment is well-structured', 'Add oral examination component', NULL, true, '2025-07-19 09:30:00+00', '2025-07-19 09:30:00+00'),
('ed9304c3-963b-4b98-85c9-a5ce67e9187d', 4, 1, 3, 3, 4, 3, 3, 'Reasonable assessment approach', 'More formative assessments', 'Good overall evaluation', false, '2025-07-19 12:15:00+00', '2025-07-19 12:15:00+00'),
('7a1ace4d-0f8b-4180-bc3b-eb50719ab757', 4, 1, 5, 5, 5, 4, 5, 'Perfect assessment system', 'No changes needed', 'Excellent evaluation', true, '2025-07-19 15:40:00+00', '2025-07-19 15:40:00+00'),

-- Batch 5: Classroom Environment feedback (15 entries)
('e95f3a92-8645-4d08-9a63-f158b77f68f9', 5, 1, 4, 4, 3, 4, 4, 'Comfortable learning environment', 'Better air conditioning needed', NULL, true, '2025-07-20 08:20:00+00', '2025-07-20 08:20:00+00'),
('c106b528-577d-4dc7-99bd-042fed922deb', 5, 1, 3, 3, 4, 3, 3, 'Classroom is adequate', 'More seating space required', 'Okay environment', false, '2025-07-20 11:45:00+00', '2025-07-20 11:45:00+00'),
('48509e62-c4ac-4cc9-a1d4-afa2bafe3c03', 5, 1, 5, 4, 4, 5, 4, 'Excellent classroom setup', 'Perfect learning space', 'Very conducive environment', true, '2025-07-20 14:30:00+00', '2025-07-20 14:30:00+00'),
('0b45f575-98b1-46ba-a029-d0c3abd106b4', 5, 1, 2, 3, 2, 2, 3, 'Poor classroom conditions', 'Urgent facilities upgrade needed', 'Distracting environment', true, '2025-07-21 09:00:00+00', '2025-07-21 09:00:00+00'),
('65f0337d-8e6e-4b90-a48a-5e13ff7a6132', 5, 1, 4, 3, 4, 4, 4, 'Good classroom atmosphere', 'Better lighting would help', NULL, false, '2025-07-21 12:25:00+00', '2025-07-21 12:25:00+00'),
('83303330-c144-4af9-93bd-f5038987397c', 5, 1, 3, 4, 3, 3, 3, 'Classroom is functional', 'More modern equipment needed', 'Acceptable conditions', true, '2025-07-21 15:50:00+00', '2025-07-21 15:50:00+00'),
('8edfe20f-da7c-4ac7-91a7-28367bd21341', 5, 1, 5, 5, 4, 5, 5, 'Outstanding classroom facilities', 'Keep maintaining high standards', 'Perfect learning space', true, '2025-07-22 08:15:00+00', '2025-07-22 08:15:00+00'),
('e56e5cd5-4cfa-4fd5-bf60-105b1f63b13b', 5, 1, 4, 4, 4, 3, 4, 'Well-maintained classroom', 'Audio system could be improved', NULL, false, '2025-07-22 13:20:00+00', '2025-07-22 13:20:00+00'),
('ed9304c3-963b-4b98-85c9-a5ce67e9187d', 5, 1, 2, 2, 3, 2, 2, 'Classroom needs renovation', 'Complete facility overhaul needed', 'Poor learning conditions', true, '2025-07-22 16:35:00+00', '2025-07-22 16:35:00+00'),
('7a1ace4d-0f8b-4180-bc3b-eb50719ab757', 5, 1, 4, 3, 4, 4, 3, 'Comfortable classroom setting', 'Temperature control improvements', NULL, true, '2025-07-23 10:10:00+00', '2025-07-23 10:10:00+00'),
('e95f3a92-8645-4d08-9a63-f158b77f68f9', 5, 1, 5, 4, 5, 5, 4, 'Excellent classroom environment', 'Continue current maintenance', 'Great learning atmosphere', false, '2025-07-23 14:40:00+00', '2025-07-23 14:40:00+00'),
('c106b528-577d-4dc7-99bd-042fed922deb', 5, 1, 3, 3, 3, 3, 4, 'Standard classroom quality', 'More interactive displays needed', 'Meets basic requirements', true, '2025-07-23 17:25:00+00', '2025-07-23 17:25:00+00'),
('48509e62-c4ac-4cc9-a1d4-afa2bafe3c03', 5, 1, 4, 4, 3, 4, 4, 'Good classroom facilities', 'Wi-Fi connectivity improvements', NULL, true, '2025-07-24 09:45:00+00', '2025-07-24 09:45:00+00'),
('0b45f575-98b1-46ba-a029-d0c3abd106b4', 5, 1, 3, 4, 3, 3, 3, 'Acceptable classroom conditions', 'Better ventilation needed', 'Satisfactory environment', false, '2025-07-24 12:30:00+00', '2025-07-24 12:30:00+00'),
('65f0337d-8e6e-4b90-a48a-5e13ff7a6132', 5, 1, 5, 5, 4, 5, 5, 'Perfect classroom setup', 'No improvements needed', 'Ideal learning space', true, '2025-07-24 16:00:00+00', '2025-07-24 16:00:00+00'),

-- Batch 6: Communication feedback (15 entries)
('83303330-c144-4af9-93bd-f5038987397c', 6, 1, 4, 4, 4, 5, 4, 'Clear and effective communication', 'Maybe speak a bit slower', NULL, true, '2025-07-25 08:30:00+00', '2025-07-25 08:30:00+00'),
('8edfe20f-da7c-4ac7-91a7-28367bd21341', 6, 1, 3, 3, 3, 3, 3, 'Communication is adequate', 'More examples during explanations', 'Standard interaction', false, '2025-07-25 11:20:00+00', '2025-07-25 11:20:00+00'),
('e56e5cd5-4cfa-4fd5-bf60-105b1f63b13b', 6, 1, 5, 4, 4, 5, 5, 'Excellent communication skills', 'Perfect clarity and engagement', 'Outstanding interaction', true, '2025-07-25 14:45:00+00', '2025-07-25 14:45:00+00'),
('ed9304c3-963b-4b98-85c9-a5ce67e9187d', 6, 1, 2, 2, 3, 2, 2, 'Poor communication skills', 'Need significant improvement', 'Difficult to understand', true, '2025-07-26 09:10:00+00', '2025-07-26 09:10:00+00'),
('7a1ace4d-0f8b-4180-bc3b-eb50719ab757', 6, 1, 4, 4, 3, 4, 4, 'Good communication overall', 'More interactive discussions', NULL, false, '2025-07-26 12:55:00+00', '2025-07-26 12:55:00+00'),
('e95f3a92-8645-4d08-9a63-f158b77f68f9', 6, 1, 3, 3, 4, 3, 3, 'Communication needs work', 'Practice public speaking skills', 'Room for improvement', true, '2025-07-26 16:15:00+00', '2025-07-26 16:15:00+00'),
('c106b528-577d-4dc7-99bd-042fed922deb', 6, 1, 5, 5, 4, 5, 4, 'Outstanding communication', 'Keep current communication style', 'Excellent presenter', true, '2025-07-27 08:40:00+00', '2025-07-27 08:40:00+00'),
('48509e62-c4ac-4cc9-a1d4-afa2bafe3c03', 6, 1, 4, 4, 4, 4, 3, 'Effective communication methods', 'Use more visual aids', NULL, false, '2025-07-27 13:25:00+00', '2025-07-27 13:25:00+00'),
('0b45f575-98b1-46ba-a029-d0c3abd106b4', 6, 1, 3, 3, 3, 4, 3, 'Communication is reasonable', 'More student engagement needed', 'Acceptable interaction', true, '2025-07-27 17:00:00+00', '2025-07-27 17:00:00+00'),
('65f0337d-8e6e-4b90-a48a-5e13ff7a6132', 6, 1, 4, 3, 4, 4, 4, 'Good communication skills', 'Continue improving', NULL, true, '2025-07-28 10:30:00+00', '2025-07-28 10:30:00+00'),
('83303330-c144-4af9-93bd-f5038987397c', 6, 1, 5, 4, 5, 5, 5, 'Exceptional communication', 'Perfect presentation skills', 'Highly engaging', false, '2025-07-28 14:10:00+00', '2025-07-28 14:10:00+00'),
('8edfe20f-da7c-4ac7-91a7-28367bd21341', 6, 1, 2, 3, 2, 2, 2, 'Communication lacks clarity', 'Work on articulation', 'Hard to follow', true, '2025-07-28 16:45:00+00', '2025-07-28 16:45:00+00'),
('e56e5cd5-4cfa-4fd5-bf60-105b1f63b13b', 6, 1, 4, 4, 3, 4, 4, 'Clear communication style', 'Add more humor to lectures', NULL, true, '2025-07-29 09:20:00+00', '2025-07-29 09:20:00+00'),
('ed9304c3-963b-4b98-85c9-a5ce67e9187d', 6, 1, 3, 3, 3, 3, 3, 'Standard communication level', 'Practice vocal variety', 'Average presentation', false, '2025-07-29 12:35:00+00', '2025-07-29 12:35:00+00'),
('7a1ace4d-0f8b-4180-bc3b-eb50719ab757', 6, 1, 5, 5, 5, 5, 4, 'Perfect communication skills', 'No changes needed', 'Excellent delivery', true, '2025-07-29 15:50:00+00', '2025-07-29 15:50:00+00'),

-- Batch 7: Other feedback (15 entries)
('e95f3a92-8645-4d08-9a63-f158b77f68f9', 7, 1, 4, 4, 4, 3, 4, 'Overall positive experience', 'Nothing specific to add', NULL, true, '2025-07-30 08:15:00+00', '2025-07-30 08:15:00+00'),
('c106b528-577d-4dc7-99bd-042fed922deb', 7, 1, 3, 3, 3, 4, 3, 'General feedback is neutral', 'Course timing could be better', 'Average experience overall', false, '2025-07-30 11:40:00+00', '2025-07-30 11:40:00+00'),
('48509e62-c4ac-4cc9-a1d4-afa2bafe3c03', 7, 1, 5, 4, 5, 4, 5, 'Exceptional overall experience', 'Everything is working well', 'Highly recommend', true, '2025-07-30 14:25:00+00', '2025-07-30 14:25:00+00'),
('0b45f575-98b1-46ba-a029-d0c3abd106b4', 7, 1, 2, 2, 2, 3, 2, 'Overall experience disappointing', 'Many areas need improvement', 'Not satisfied', true, '2025-07-30 17:10:00+00', '2025-07-30 17:10:00+00'),
('65f0337d-8e6e-4b90-a48a-5e13ff7a6132', 7, 1, 4, 4, 3, 4, 4, 'Good overall course experience', 'Course schedule optimization', NULL, false, '2025-07-31 09:30:00+00', '2025-07-31 09:30:00+00'),
('83303330-c144-4af9-93bd-f5038987397c', 7, 1, 3, 3, 4, 3, 3, 'Mixed overall experience', 'Some improvements possible', 'Satisfactory course', true, '2025-07-31 12:15:00+00', '2025-07-31 12:15:00+00'),
('8edfe20f-da7c-4ac7-91a7-28367bd21341', 7, 1, 5, 5, 5, 4, 5, 'Outstanding overall quality', 'Continue excellent work', 'Perfect course experience', true, '2025-07-31 15:00:00+00', '2025-07-31 15:00:00+00'),
('e56e5cd5-4cfa-4fd5-bf60-105b1f63b13b', 7, 1, 4, 3, 4, 4, 3, 'Good general experience', 'More career guidance integration', NULL, false, '2025-07-31 17:45:00+00', '2025-07-31 17:45:00+00'),
('ed9304c3-963b-4b98-85c9-a5ce67e9187d', 7, 1, 2, 3, 2, 2, 3, 'Overall experience below average', 'Comprehensive course redesign', 'Not meeting expectations', true, '2025-07-31 20:20:00+00', '2025-07-31 20:20:00+00'),
('7a1ace4d-0f8b-4180-bc3b-eb50719ab757', 7, 1, 4, 4, 4, 3, 4, 'Positive general feedback', 'Course pacing improvements', NULL, true, '2025-07-31 22:35:00+00', '2025-07-31 22:35:00+00'),
('e95f3a92-8645-4d08-9a63-f158b77f68f9', 7, 1, 5, 4, 5, 5, 4, 'Excellent overall satisfaction', 'Perfect course design', 'Exceeded expectations', false, '2025-07-31 23:50:00+00', '2025-07-31 23:50:00+00'),
('c106b528-577d-4dc7-99bd-042fed922deb', 7, 1, 3, 3, 3, 3, 3, 'Standard overall quality', 'Minor enhancements needed', 'Meets basic expectations', true, '2025-07-31 23:55:00+00', '2025-07-31 23:55:00+00'),
('48509e62-c4ac-4cc9-a1d4-afa2bafe3c03', 7, 1, 4, 4, 3, 4, 4, 'Good overall impression', 'Technology integration improvements', NULL, true, '2025-07-31 23:57:00+00', '2025-07-31 23:57:00+00'),
('0b45f575-98b1-46ba-a029-d0c3abd106b4', 7, 1, 3, 4, 3, 3, 3, 'Acceptable overall experience', 'Better resource allocation', 'Satisfactory outcome', false, '2025-07-31 23:58:00+00', '2025-07-31 23:58:00+00'),
('65f0337d-8e6e-4b90-a48a-5e13ff7a6132', 7, 1, 5, 5, 4, 5, 5, 'Perfect overall experience', 'Maintain current high standards', 'Outstanding course', true, '2025-07-31 23:59:00+00', '2025-07-31 23:59:00+00');