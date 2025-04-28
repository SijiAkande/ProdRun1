import React, { useState } from 'react';
import CollegeSelector from '../components/CollegeSelector';
import ProgramSelector from '../components/ProgramSelector';
import YearSelector from '../components/YearSelector';
import SemesterSelector from './SemesterSelector.jsx';
import CoursesDisplay from '../components/CoursesDisplay';
import programsData from '../programsdata.json';

const Placeholder = () => {
  const [selectedCollege, setSelectedCollege] = useState(null);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [grades, setGrades] = useState({});

  const handleCollegeChange = (e) => {
    const college = programsData.find((c) => c.college === e.target.value) || null; 
    setSelectedCollege(college);
    setSelectedProgram(null);
    setSelectedYear(null);
    setSelectedSemester(null);
  };

  const handleProgramChange = (e) => {
    const program = selectedCollege?.programs.find((p) => p.program === e.target.value) || null; 
    setSelectedProgram(program);
    setSelectedYear(null);
    setSelectedSemester(null);
  };

  const handleYearChange = (e) => {
    const year = selectedProgram?.years.find((y) => y.year === e.target.value) || null; 
    setSelectedYear(year);
    setSelectedSemester(null);
  };

  const handleSemesterChange = (e) => {
    const semester = selectedYear?.semesters.find((s) => s.semester === e.target.value) || null; 
    setSelectedSemester(semester);
  };

  const getCoursesUpUntil = () => {
    if (!selectedProgram || !selectedYear || !selectedSemester) return [];
    const semesters = [];
    const stopAtYear = selectedYear.year; // e.g., "200 Level"
    const stopAtSemester = selectedSemester.semester; // e.g., "Alpha"
  
    let reachedTarget = false;
  
    for (const year of selectedProgram.years) {
      for (const semester of year.semesters) {
        const coursesWithSemester = semester.courses.map(course => ({
          ...course,
          semester: semester.semester,
          year: year.year,
        }));
  
        const electivesWithSemester = semester.electives.map(elective => ({
          ...elective,
          semester: semester.semester,
          year: year.year,
        }));
  
        semesters.push({
          ...year,
          ...semester,
          courses: coursesWithSemester,
          electives: electivesWithSemester,
        });
  
        if (year.year === stopAtYear && semester.semester === stopAtSemester) {
          reachedTarget = true;
          break;
        }
      }
      if (reachedTarget) break;
    }
  
    return semesters;
  };
  

  const handleGradeChange = (course, grade) => {
    setGrades((prevGrades) => ({ ...prevGrades, [course]: grade }));
  };

  const getGradePoints = (grade) => {
    switch (grade) {
      case 'A': return 5;
      case 'B': return 4;
      case 'C': return 3;
      case 'D': return 2;
      case 'F': return 0;
      default: return 0; // Default to 0 if no valid grade
    }
  };
  

  const calculateGPA = () => {
    let totalGradePoints = 0;
    let totalCredits = 0;
  
    getCoursesUpUntil().forEach(({ courses, electives }) => {
      courses.forEach((course) => {
        const grade = grades[course.courseName];
        if (grade !== null && grade !== undefined) { // Only graded courses
          totalGradePoints += getGradePoints(grade) * course.credits;
          totalCredits += course.credits;
        }
      });
  
      electives.forEach((elective) => {
        const grade = grades[elective.courseName];
        if (grade !== null && grade !== undefined) { // Only graded electives
          totalGradePoints += getGradePoints(grade) * elective.credits;
          totalCredits += elective.credits;
        }
      });
    });
  
    return totalCredits > 0 ? (totalGradePoints / totalCredits) : 0;

  };

  const determineClass = () => {
    const numericGPA = parseFloat(calculateGPA());
  
    if (isNaN(numericGPA)) {
      return 'Third Class';
    }
  
    if (numericGPA >= 4.50 && numericGPA <= 5.00) {
      return 'First Class';
    } else if (numericGPA >= 3.50 && numericGPA <= 4.49) {
      return 'Second Class Upper';
    } else if (numericGPA >= 2.40 && numericGPA <= 3.49) {
      return 'Second Class Lower';
    } else if (numericGPA >= 1.50 && numericGPA <= 2.39) {
      return 'Third Class';
    } else {
      return 'Advised to Withdraw';
    }
  };
  
  
  

  return (
    <div>
      <div className="bg-gray-900 rounded-lg p-6 mt-5 items-center">
        <div className="grid grid-cols-1 md:grid-cols-1 gap-4 p-4 rounded-lg">
          <div className="rounded-lg shadow-md p-6">
            <CollegeSelector programsData={programsData} handleCollegeChange={handleCollegeChange} />
            {selectedCollege && (
              <div>
                <ProgramSelector selectedCollege={selectedCollege} handleProgramChange={handleProgramChange} />
                {selectedProgram && (
                  <div>
                    <YearSelector selectedProgram={selectedProgram} handleYearChange={handleYearChange} />
                    {selectedYear && (
                      <div className="items-center md:items stretch">
                        <SemesterSelector selectedYear={selectedYear} handleSemesterChange={handleSemesterChange} />
                        {selectedSemester && (
                          <CoursesDisplay
                            getCoursesUpUntil={getCoursesUpUntil}
                            handleGradeChange={handleGradeChange}
                            calculateGPA={calculateGPA}
                            grades={grades}
                            determineClass={determineClass}
                          />
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Placeholder;
