Feature: Scan

  Background:
    Given user is onboarded with skipped password creation

  Scenario: C225 Scan - Loads correctly
    When user click on scan button
    Then scan screen load correctly

  Scenario: C226 Scan - Not recognized paste contents
    Given user click on scan button
    When user paste faulty content
    Then a error message appear

  Scenario: C307 Scan - Paste contents successfully
    Given user click on scan button
    When user paste content
    Then connection setup successfully

  Scenario: C382 Scan - Of QR code is successful
    Given user click on scan button
    When user scan a QR code
    Then connection setup successfully

  Scenario: C971 Scan - User can switch to front camera and go back to rear one
    Given user go to Scan screen
    When user tap switch camera icon on Scan screen
    And user can see rear camera on Scan screen
    Then user is able to scan on Scan screen