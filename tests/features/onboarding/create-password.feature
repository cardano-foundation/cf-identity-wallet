Feature: CreatePassword

  Background:
    Given user tap Get Started button on Onboarding screen
    And user generate passcode on Passcode screen


  Scenario: C160 CreatePassword - user can cancel skipping password creation
    Given user tap Skip button on Create Password screen
    When tap Cancel button on alert modal for Create Password screen
    Then user can see Create Password screen

  Scenario: C161 CreatePassword - user can skip password creation
    Given user tap Skip button on Create Password screen
    When tap Confirm button on alert modal for Create Password screen
    Then user can see Your Recovery Phrase screen

  Scenario: C162 CreatePassword - user can set password successfully with all conditions
    Given user generated a password of 10 characters
    And user type in password on Create Password screen
    And all conditions are displayed as passed on Create Password screen
    And user confirm type in password on Create Password screen
    When user tap Create Password button on Create Password screen
    Then user can see Your Recovery Phrase screen

  Scenario Outline: <caseId> CreatePassword - user can set <name> password length
    Given user generated a password of <length> characters
    And user type in password on Create Password screen
    And user confirm type in password on Create Password screen
    When user tap Create Password button on Create Password screen
    Then user can see Your Recovery Phrase screen
    Examples:
      | caseId | name    | length |
      | C163   | maximum | 64     |
      | C164   | minimum | 8      |

  Scenario: C165 CreatePassword - user can set password with hint
    Given user generated a password of 10 characters
    And user type in password on Create Password screen
    And user confirm type in password on Create Password screen
    And user type in hint for the password on Create Password screen
    When user tap Create Password button on Create Password screen
    Then user can see Your Recovery Phrase screen

  Scenario Outline: <caseId> CreatePassword - validation for <name>
    Given user type in password <password> on Create Password screen
    Then user can see <errorMessage> on Create Password screen
    Examples:
      | caseId | name                          | password                                                          | errorMessage                         |
      | C166   | too long password             | 1234567asdwer@#$3FSvcvxzvxvfas4af4afavbns2adfasfs4wfsagsfssfewfa2 | Must contain between 8-64 characters |
      | C167   | too short password            | 1234567                                                           | Must contain between 8-64 characters |
      | C168   | lack of uppercase in password | !a345678                                                          | Must contain an uppercase letter     |
      | C169   | lack of lowercase in password | !A345678                                                          | Must contain a lowercase letter      |
      | C170   | lack of symbol in password    | 12345678Qw                                                        | Must contain a valid symbol          |
      | C171   | lack of number in password    | !Aasdfgq                                                          | Must contain a number                |
