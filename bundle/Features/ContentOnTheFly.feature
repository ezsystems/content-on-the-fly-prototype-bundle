Feature: Basic interactions for ContentOnTheFly

  Background:
    Given I am logged in as admin on StudioUI

    @javascript @common @contentOnTheFly
      Scenario: I can create Content directly from the Dashboard
      Given I start creating content from the Dashboard
      And I create Article from Content group in "Home/Places & Tastes/Tastes" location
      And I fill in basic Article data
      When I click the edit action bar button Publish
      Then I can create another content

    @javascript @common @contentOnTheFly @flex
    Scenario: I can create Content directly from the Dashboard and send it for review
      Given I start creating content from the Dashboard
      And I create Article from Content group in "/Media" location
      And I fill in basic Article data
      And I make a modification to "Title*:" and send it for review
      And I select reviewer "Yura Rajzer"
      When I confirm sending for review
      Then I can create another content

    @javascript @common @contentOnTheFly
    Scenario: I can create Content from the Universal Discovery widget
      Given I click on the navigation zone "Content"
      And I click on the navigation item "Content structure"
      And I click on the discovery bar button "Content browse"
      And I start creating content from the Universal Discovery widget
      And I create Gallery from Media group in "/Media" location
      And I fill in Name with "Gallery Title"
      When I click the edit action bar button Publish
      Then I can create another content

    @javascript @common @contentOnTheFly
    Scenario: I can create embedded Content while creating another Content
      Given I start creating content from the Dashboard
      And I select Article from the Content group
      And I finish configuration
      And I choose Embed for the Summary block
      And I start creating content from the Universal Discovery widget
      And I create Article from Content group in "Home/Places & Tastes" location
      And I fill in basic Article data
      And I click the edit action bar button Publish
      And I see embedded content in Summary section
      When I click the edit action bar button Publish
      Then I can create another content
    
    @javascript @common @contentOnTheFly
    Scenario: I can create embedded Content while configuring a Block
      Given I go to Studio creator and prepare for "Embed" block
      And I set up the Embed block element in the landing page zone first
      And I click on the pop-up form button Content
      And I start creating content from the Universal Discovery widget
      And I create "Blog post" from Content group in "Home/Places & Tastes" location
      And I fill in basic Blog post data
      And I click the edit action bar button Publish
      When I submit the block pop-up form
      Then I see the Embed block with Article and its preview in first zone
    
    @javascript @fullRegression @contentOnTheFly
    Scenario: I can change Content Type after selecting it
      Given I start creating content from the Dashboard
      And I select Article from the Content group
      And I change Content Type to Gallery from Media group
      And I select "/Media" from Suggested Locations
      And I finish configuration
      And I fill in Name with "Gallery Title"
      When I click the edit action bar button Publish
      Then I can create another content
