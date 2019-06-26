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
  query: "",

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
        console.log(readOnly);
        this.send('getEditorContent');
        this.set("cnlQuery",this.get("content"));
        //alert(this.get("content"));
        this.send('splitTags');
        this.send('makeSQLQueryForTags');
        //this.send('insertSQL');
        this.send('displaySQL');    
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

    splitTags(){
        var splittedTags = this.get("content").split("t:");
        var tagList = [];
        for (let i = 1; i<splittedTags.length; i++){
            tagList.push(splittedTags[i].split(" ")[0]);
        }

        this.set("tags",tagList);
        //alert(this.get('tags'));
    },

    makeSQLQueryForTags(){
      var appendedTagsForSQL="";
      var tagList=this.get("tags");
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

    },

    insertSQL(){
      let SQLEditor = document.getElementsByTagName("ace-editor")[0];
      SQLEditor.id="sqlEditor"
      alert(SQLEditor.id);
    },

    displaySQL(){
        let SQLEditor=document.getElementsByClassName("ace_editor")[1];
        SQLEditor.setAttribute("id","sqlEditor");
        console.log(SQLEditor);
        let editor = ace.edit("sqlEditor");
        this._editor.getSession().setValue(this.get("cnlQuery"));
        editor.setTheme("ace/theme/chrome");
        editor.setShowPrintMargin(false);
        editor.setOptions({ fontSize: "14px" });
        editor.getSession().setMode("ace/mode/" + "sql");
        editor.getSession().setValue(this.get("query"));
    }

  } 

});
