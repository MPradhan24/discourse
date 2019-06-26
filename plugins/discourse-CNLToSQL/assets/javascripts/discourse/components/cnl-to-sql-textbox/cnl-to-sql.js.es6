import { popupAjaxError } from "discourse/lib/ajax-error";
import { bufferedProperty } from "discourse/mixins/buffered-content";
import { propertyNotEqual } from "discourse/lib/computed";
import computed from "ember-addons/ember-computed-decorators";


// const NoQuery = Query.create({ name: "No queries", fake: true });

export default Ember.Component.extend({


  saving: false,
  savingStatus: "",

  badgeTypes: Ember.computed.alias("adminBadges.badgeTypes"),
  badgeGroupings: Ember.computed.alias("adminBadges.badgeGroupings"),
  badgeTriggers: Ember.computed.alias("adminBadges.badgeTriggers"),
  protectedSystemFields: Ember.computed.alias(
    "adminBadges.protectedSystemFields"
  ),

  readOnly: Ember.computed.alias("buffered.system"),
  showDisplayName: propertyNotEqual("name", "displayName"),

  content: "Hi",
  _editor: null,

  didInsertElement() {
    this._super(...arguments);

    loadScript("/javascripts/ace/ace.js").then(() => {
      window.ace.require(["ace/ace"], loadedAce => {
        if (!this.element || this.isDestroying || this.isDestroyed) {
          return;
        }
        const editor = loadedAce.edit(this.$(".ace")[0]);

        editor.setTheme("ace/theme/chrome");
        editor.setShowPrintMargin(false);
        editor.setOptions({ fontSize: "14px" });
        editor.getSession().setMode("ace/mode/" + this.mode);
        editor.on("change", () => {
          this._skipContentChangeEvent = true;
          this.set("content", editor.getSession().getValue());
          this._skipContentChangeEvent = false;
        });
        editor.$blockScrolling = Infinity;
        editor.renderer.setScrollMargin(10, 10);

        this.$().data("editor", editor);
        this._editor = editor;
        this.changeDisabledState();

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
      });
    });
    alert("Helllo");
    return this.get("content");
  },


  selectedItem: function() {
    const id = parseInt(this.get("selectedQueryId"));
    const item = this.get("model").find(q => q.get("id") === id);
    !isNaN(id)
      ? this.set("showRecentQueries", false)
      : this.set("showRecentQueries", true);
    if (id < 0) this.set("editDisabled", true);
    return item || NoQuery;
  }.property("selectedQueryId"),


  _resetSaving: function() {
    this.set("saving", false);
    this.set("savingStatus", "");
  }.observes("model.id"),

  actions: {
    save() {
      if (!this.saving) {
        let fields = [
          "allow_title",
          "multiple_grant",
          "listable",
          "auto_revoke",
          "enabled",
          "show_posts",
          "target_posts",
          "name",
          "description",
          "long_description",
          "icon",
          "image",
          "query",
          "badge_grouping_id",
          "trigger",
          "badge_type_id"
        ];

        if (this.get("buffered.system")) {
          var protectedFields = this.protectedSystemFields || [];
          fields = _.filter(fields, f => !protectedFields.includes(f));
        }

        this.set("saving", true);
        this.set("savingStatus", I18n.t("saving"));

        const boolFields = [
          "allow_title",
          "multiple_grant",
          "listable",
          "auto_revoke",
          "enabled",
          "show_posts",
          "target_posts"
        ];

        const data = {};
        const buffered = this.buffered;
        fields.forEach(function(field) {
          var d = buffered.get(field);
          if (boolFields.includes(field)) {
            d = !!d;
          }
          data[field] = d;
        });

        const newBadge = !this.id;
        const model = this.model;
        this.model
          .save(data)
          .then(() => {
            if (newBadge) {
              const adminBadges = this.get("adminBadges.model");
              if (!adminBadges.includes(model)) {
                adminBadges.pushObject(model);
              }
              this.transitionToRoute("adminBadges.show", model.get("id"));
            } else {
              this.commitBuffer();
              this.set("savingStatus", I18n.t("saved"));
            }
          })
          .catch(popupAjaxError)
          .finally(() => {
            this.set("saving", false);
            this.set("savingStatus", "");
          });
      }
    },

    destroy() {
      const adminBadges = this.get("adminBadges.model");
      const model = this.model;

      if (!model.get("id")) {
        this.transitionToRoute("adminBadges.index");
        return;
      }

      return bootbox.confirm(
        I18n.t("admin.badges.delete_confirm"),
        I18n.t("no_value"),
        I18n.t("yes_value"),
        result => {
          if (result) {
            model
              .destroy()
              .then(() => {
                adminBadges.removeObject(model);
                this.transitionToRoute("adminBadges.index");
              })
              .catch(() => {
                bootbox.alert(I18n.t("generic_error"));
              });
          }
        }
      );
    },

    logit(){
     //    let fields = [
     //      "allow_title",
     //      "multiple_grant",
     //      "listable",
     //      "auto_revoke",
     //      "enabled",
     //      "show_posts",
     //      "target_posts",
     //      "name",
     //      "description",
     //      "long_description",
     //      "icon",
     //      "image",
     //      "query",
     //      "badge_grouping_id",
     //      "trigger",
     //      "badge_type_id"
     //    ];

     //    if (this.get("buffered.system")) {
     //      var protectedFields = this.protectedSystemFields || [];
     //      fields = _.filter(fields, f => !protectedFields.includes(f));
     //    }

    	// const data = {};
     //    const buffered = this.buffered;
     //    fields.forEach(function(field) {
     //      var d = buffered.get(field);
     //      if (boolFields.includes(field)) {
     //        d = !!d;
     //      }
     //      data[field] = d;
     //    });

	
        const editor = ace.edit("editor1");

        editor.setTheme("ace/theme/chrome");
        editor.setShowPrintMargin(false);
        editor.setOptions({ fontSize: "14px" });
        editor.getSession().setMode("ace/mode/" + this.mode);
        editor.on("change", () => {
          this.set("content", editor.getSession().getValue());
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

        
    	alert(this.get("content"));
    }
  }
});
