Feature: Menu setting manage password - Enable operations password during onboarding

  Scenario: C408 MenuSettingsManagePassword - Enable operations password during onboarding
    Given user is onboarded with a 10 characters password
    And user tap Menu button on Tab bar
    And user tap Settings button on Menu screen
    And user tap on Manage Operation Password button on Menu screen
    Then user see the status of Operations Password is true