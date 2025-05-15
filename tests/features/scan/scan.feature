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