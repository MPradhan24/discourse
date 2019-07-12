# DiscourseCNLForBadges

  DiscourseCNLForBadges is a plugin for automatically converting a query written in CNL(Controlled Natural Language) to SQL(Structured Query Language) for badge awarding to users. CNL is a subset of Natural language, and hence has restricted syntax and restricted semantics. The CNL syntax used in this plugin is inspired from Attempto Controlled English(ACE), which is like English and is very easy to learn and use. In Attempto Parsing Engine(APE),which is a parser that implements the construction and interpretation rules of ACE, markers like a: and n: are used to mark the adjectives and nouns respectively in order to dismiss the confusion regarding unknown words, as ACE like any other CNL has restricted semantics. Deriving from this, we have made use of markers like t:, b: and g: in order to identify tag-names, badge-names and group-names respectively.
  The badge awarding criteria could therefore be written even if proficiency at SQL is not obtained. This would be highly advantageous.
  

## Installation

Follow [Install a Plugin](https://meta.discourse.org/t/install-a-plugin/19157)
how-to from the official Discourse Meta, using `git clone https://github.com/MPradhan24/discourse-CNLForBadges.git`
as the plugin command.

                                                  OR
                                                  
 Clone this repo: `git clone https://github.com/MPradhan24/discourse-CNLForBadges.git`into the plugins directory.

## Usage
   The SQL editor for writing the badge-awarding criteria should be visible first in order for this plugin outlet to be visible. After installing this plugin, enable it in settings for the CNL editor to appear.
  At present, we have provided three standard CNL templates for the badge awarding criteria. 
  
  
  ##Template 1: This is related to the tags received on a post by a user and the corresponding badge that can be awarded;
  
  Corresponding CNL Syntax: If user X has received t:tagName1 and t:tagName2 and t:tagName3...... then grant this badge.
  
  
  ##Template 2: This is related to awarding a custom badge to a user who has certain prescribed numbers of a few other different badges.
  
  Corresponding CNL Syntax: If user X has atleast 3 badges of b:badgeName1 and atleast 2 badges of b:badgeName2 and ..... then grant this badge.
  
  
  ##Template 3: This is related to awarding a category badge based on a threshold number of badges received by the user from the corresponding category.
  
  Corresponding CNL Syntax: If user X has atleast 4 badges from badge group g:groupName then grant this badge.
  
  
  On Clicking the "Check Templates" beside the editor, these permissible templates will be shown. For time saving facilitation, we have implemented the direct copying of the template to the editor on clicking the corresponding template. A refresh button is provided to clear the CNL editor. A button to generate corresponding SQL query in the SQL editor is also provided. In case the user enters a wrong format of CNL Query, an error message is displayed.

## Feedback

If you have issues or suggestions for the plugin, please bring them up on
[Discourse Meta](https://meta.discourse.org).


## Developers
Smit Sheth (username on meta.discourse : Sheth_Smit)

Mrinal Pradhan (username on meta.discourse : M_Pradhan)

# discourse-CNLForBadges

