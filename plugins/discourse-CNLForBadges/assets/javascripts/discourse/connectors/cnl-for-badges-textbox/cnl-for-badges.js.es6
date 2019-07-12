import { popupAjaxError } from "discourse/lib/ajax-error";
import { bufferedProperty } from "discourse/mixins/buffered-content";
import { propertyNotEqual } from "discourse/lib/computed";

import {computed, observes} from "ember-addons/ember-computed-decorators";
import loadScript from "discourse/lib/load-script";
import { readOnly } from "admin/controllers/admin-badges-show";


// const NoQuery = Query.create({ name: "No queries", fake: true });

export default ({

  mode: "sql",
  content: "",
  cnlQuery: "",
  _editor: null,
  tags: [],
  badges: [],
  badge_groups: [],
  nums: [],
  query: "",
  template: "",

  @observes("content")
  contentChanged() {
    if (this._editor && !this._skipContentChangeEvent) {
      this._editor.getSession().setValue(this.content);
    }
  },

  @observes("mode")
  modeChanged() {
    if (this._editor && !this._skipContentChangeEvent) {
      this._editor.getSession().setMode("ace/mode/" + this.mode);
    }
  },

  actions: {

    convert(){
        this.send('getEditorContent');
        this.set("cnlQuery",this.get("content"));
        this.send('splitInput');     
    },

    getEditorContent(){

      let editor = ace.edit("cnl-editor");

      editor.setTheme("ace/theme/chrome");
      editor.setShowPrintMargin(false);
      editor.setOptions({ fontSize: "14px" });
      editor.on("change", () => {
        this._skipContentChangeEvent = true;
        this.set("content", editor.getSession().getValue());
        this._skipContentChangeEvent = false;
      });
      editor.$blockScrolling = Infinity;
      editor.renderer.setScrollMargin(10, 10);

      this.$().data("editor", editor);
      this._editor = editor;

      $(window)
        .off("ace:resize")
        .on("ace:resize", () => {
          this.appEvents.trigger("ace:resize");
        });

      if (this.appEvents) {
        // xxx: don't run during qunit tests
        this.appEvents.on("ace:resize", this, "resize");
      }

      if (this.autofocus) {
        this.send("focus");
      }      

    },

    splitInput(){
      let splittedTags = this.get("content").split("t:");
      let lenTag = splittedTags.length;

      let splittedBadges = this.get("content").split("b:");
      let lenBadge = splittedBadges.length;
      
      let thresholdNum = this.get("content").split("atleast ");
      let lenNum = thresholdNum.length;

      let splittedBadgeGroups = this.get("content").split("g:");
      let lenBG = splittedBadgeGroups.length;


       if(lenTag>1){
          this.send('makeSQLQueryForTags', splittedTags, lenTag);
        }
        else if(lenBadge>1 && lenBadge==lenNum){
          this.send("makeSQLQueryForBadges", splittedBadges, lenBadge, thresholdNum, lenNum);
        }
        else if(lenBG==2 && lenBG==lenNum){
          this.send("makeSQLQueryForBadgeGroup", splittedBadgeGroups, lenBG, thresholdNum, lenNum);
        }
        else
          this.send('wrongQueryFormat');
    },

    makeSQLQueryForTags(splittedTags, lenTag){
      var tagList = [];
      for (let i = 1; i<lenTag; i++){
          tagList.push(splittedTags[i].split(" ")[0]);
      }

      // Splitting names with '-' to ' '
      for (let i = 0; i<tagList.length; i++){
        tagList[i]=tagList[i].split("-").join(" ");
      }

      this.set("tags",tagList);

      var appendedTagsForSQL="";
      for(let i = 0; i < tagList.length; i++){
        appendedTagsForSQL += "NAME = \'" + tagList[i] + "\' or ";
      }
      appendedTagsForSQL=appendedTagsForSQL.substr(0,appendedTagsForSQL.length-3);

      var q = 

`WITH twt AS (
 SELECT DISTINCT tt.TOPIC_ID FROM TOPIC_TAGS tt   
  WHERE(
      SELECT COUNT(*) from (
          SELECT DISTINCT tt1.TAG_ID AS tid
          FROM TOPIC_TAGS tt1
          WHERE tt1.TAG_ID in(
              SELECT ID 
              FROM TAGS
              WHERE ` + appendedTagsForSQL + `
          )
          AND tt1.TOPIC_ID = tt.TOPIC_ID
      ) AS tag_count
  ) >= ` + tagList.length + `
),

post AS (
    SELECT ID, USER_ID, p.TOPIC_ID, p.created_at as created_at
    FROM POSTS AS p
    INNER JOIN twt
    ON p.TOPIC_ID = TWT.TOPIC_ID
)

SELECT DISTINCT t.USER_ID AS user_id, current_timestamp AS granted_at, post.ID AS post_id
FROM TOPICS t
INNER JOIN twt
ON twt.TOPIC_ID = t.ID
INNER JOIN post
ON post.USER_ID = t.USER_ID AND post.TOPIC_ID = twt.TOPIC_ID
WHERE (:backfill OR post.ID IN (:post_ids))`;


            this.set("query",q);
            this.send('displaySQL'); 

    },

    makeSQLQueryForBadges(splittedBadges, lenBadge, thresholdNum, lenNum){

      var badgeList = [];
      var numList = [];

      for (let i = 1; i<lenBadge; i++){
          badgeList.push(splittedBadges[i].split(" ")[0]);
      }

      for (let i = 1; i<lenNum; i++){
          numList.push(thresholdNum[i].split(" ")[0]);
          if(isNaN(numList[i-1])){
            this.send('wrongQueryFormat');
            return;
          }
      }

      // Splitting names with '-' to ' '
      for (let i = 0; i<badgeList.length; i++){
        badgeList[i]=badgeList[i].split("-").join(" ");
      }

      this.set("badges",badgeList);
      this.set("nums",numList);

      var q = 'WITH user_eligible AS ( \n'
      for(let i=0;i<badgeList.length;i++){

          q = q + `\tSELECT USER_ID
    FROM USER_BADGES
    WHERE BADGE_ID IN (
        SELECT ID
        FROM BADGES
        WHERE NAME = \'`+badgeList[i]+`\' \n
    )
    GROUP BY USER_ID
    HAVING COUNT(BADGE_ID)>=`+numList[i]+'\n'

        if(i<badgeList.length-1){
          q = q + '\t\tINTERSECT \n'
        }
      }
      q = q + ` \t)

SELECT DISTINCT u.USER_ID AS user_id, current_timestamp AS granted_at
FROM user_eligible u`;

        this.set("query", q);
        this.send('displaySQL'); 
    },

    makeSQLQueryForBadgeGroup(splittedBadgeGroups, lenBG, thresholdNum, lenNum){
      let badgeGroup = splittedBadgeGroups[1].split(" ")[0];
      let num = thresholdNum[1].split(" ")[0];

      // Splitting names with '-' to ' '
      badgeGroup=badgeGroup.split("-").join(" ");

      let q = 
`WITH user_permissible AS ( 
  SELECT USER_ID
      FROM USER_BADGES
      WHERE BADGE_ID IN (
          SELECT ID
          FROM BADGES
          WHERE BADGE_GROUPING_ID IN(
              SELECT ID 
              FROM BADGE_GROUPINGS
              WHERE NAME = \'` + badgeGroup + `\'
          ) 
      )
      GROUP BY USER_ID
      HAVING COUNT(BADGE_ID) >= ` + num + `
  )
SELECT DISTINCT u.USER_ID AS user_id, current_timestamp AS granted_at
FROM user_permissible u
`;

      this.set("query", q);
      this.send("displaySQL");
    },

    displaySQL(){
        let SQLEditor=document.getElementsByClassName("ace_editor")[1];
        SQLEditor.setAttribute("id","sqlEditor");
        let editor = ace.edit("sqlEditor");
        this._editor.getSession().setValue(this.get("cnlQuery"));
        editor.setTheme("ace/theme/chrome");
        editor.setShowPrintMargin(false);
        editor.setOptions({ fontSize: "14px" });
        editor.getSession().setMode("ace/mode/" + "sql");
        editor.getSession().setValue(this.get("query"));
    },

    makeTemplate(){
      let temp = 
      `<ol class = \"templateList\">
          <li>If user X has received t:tag_name_1 and t:tag_name_2 then grant X this badge.</li>
          <br>
          <li>If user X has atleast 3 badges of b:badge_name_1 and atleast 2 badges of b:badge_name_2 then grant X this badge.</li>
          <br>
          <li>If user X has atleast 3 badges from badge group g:badge_group then grant X this badge</li>
      </ol>`
      ;

      this.set("template",temp);
    },

    showTemplates(){
        let infobox = document.getElementsByClassName("overlay")[0];
        let popupContent = document.getElementsByClassName("content")[0];
        let popupTitle = document.getElementsByTagName("h2")[0];
        let popupNote = document.getElementsByTagName("h4")[0];

        this.send("makeTemplate");
        
        popupContent.innerHTML = this.get("template");
        popupTitle.innerHTML = "Permissible Templates";
        
        popupTitle.style.color = "#333";
        popupNote.style.display = "block";
        infobox.style.display = "block";

        this.send('getEditorContent');
        if(this.get("cnlQuery")!=undefined){
          this._editor.getSession().setValue(this.get("cnlQuery"));
        }
        else{
          this._editor.getSession().setValue("");
        } 
        /*To show the clicked template in the SQL textbox*/

        let items = document.querySelectorAll('.templateList > li');
        items.forEach(item => {
          item.addEventListener(
            'click', (e) => {
              this._editor.getSession().setValue(e.target.textContent);
              this.send('hideTemplates');
            }
          )
        });
    },

    hideTemplates(){
        let infobox = document.getElementsByClassName("overlay")[0];
        infobox.style.display = "none";
    },

    wrongQueryFormat(){
        let infobox = document.getElementsByClassName("overlay")[0];
        let popupContent = document.getElementsByClassName("content")[0];
        let popupTitle = document.getElementsByTagName("h2")[0];
        let popupNote = document.getElementsByTagName("h4")[0];
        
        popupTitle.innerHTML = "<center>ERROR!</center>";
        popupContent.innerHTML = "Wrong Query Format.<br>Please click the help icon beside textbox for assistance with Templates.";
        
        popupTitle.style.color = "red";
        popupNote.style.display = "none";
        infobox.style.display = "block";
        
        this._editor.getSession().setValue(this.get("cnlQuery"));
    },

    clearCNLTextbox(){
        this.send("getEditorContent");
        this._editor.getSession().setValue("");
    }

  } 

});
