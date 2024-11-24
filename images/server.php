<?php
// Include PhpSpreadsheet library (make sure you have installed it using Composer)
require 'vendor/autoload.php';

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

// Check if the form is submitted
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Collect form data
    $name = $_POST['name'];
    $email = $_POST['email'];
    $message = $_POST['message'];

    // Create a new spreadsheet or load the existing one
    if (!file_exists('submissions.xlsx')) {
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        // Add headers
        $sheet->setCellValue('A1', 'Name');
        $sheet->setCellValue('B1', 'Email');
        $sheet->setCellValue('C1', 'Message');
    } else {
        $spreadsheet = \PhpOffice\PhpSpreadsheet\IOFactory::load('submissions.xlsx');
        $sheet = $spreadsheet->getActiveSheet();
    }

    // Find the next available row
    $row = $sheet->getHighestRow() + 1;

    // Save the form data in the next row
    $sheet->setCellValue('A' . $row, $name);
    $sheet->setCellValue('B' . $row, $email);
    $sheet->setCellValue('C' . $row, $message);

    // Save the spreadsheet
    $writer = new Xlsx($spreadsheet);
    $writer->save('submissions.xlsx');

    echo "Form submitted successfully!";
}
?>