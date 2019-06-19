import { popupAjaxError } from "discourse/lib/ajax-error";
import { bufferedProperty } from "discourse/mixins/buffered-content";
import { propertyNotEqual } from "discourse/lib/computed";

import {computed, observes} from "ember-addons/ember-computed-decorators";
import loadScript from "discourse/lib/load-script";


// const NoQuery = Query.create({ name: "No queries", fake: true });

export default ({

  mode: "text",
  content: "",
  _editor: null,

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
        alert(this.get("content"));
        this._editor.getSession().setValue(this.get("content"));
    },

    getEditorContent(){

      const editor = ace.edit("cnl-editor");

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

    }

  } 

});
