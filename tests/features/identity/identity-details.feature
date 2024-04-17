Feature: Identity Details

  Background:
    Given user is onboarded with skipped password creation

  Scenario: Identity Details - Done button on card details screen of KERI default identifier works correctly
    Given user add KERI identity through plus icon
    Then user can see toast message about created identity on Identity screen
    And user can see identity card details
    When user chose newly created identity on Identity screen
    And user can see Card Details screen for KERI
    And tap Done button on Card Details screen
    Then user can see Identity screen with 1 card

  Scenario: Identity Details - User can copy card details of KERI default identifier
    Given identifier is created and user can see Card Details screen for KERI
    Then user copy and verify details for KERI
