import {
  default as computed,
  observes
} from "ember-addons/ember-computed-decorators";
import { FORMAT } from "select-kit/components/future-date-input-selector";
import { PUBLISH_TO_CATEGORY_STATUS_TYPE } from "discourse/controllers/edit-topic-timer";

export default Ember.Component.extend({
  selection: null,
  date: null,
  time: null,
  includeDateTime: true,
  isCustom: Ember.computed.equal("selection", "pick_date_and_time"),
  isBasedOnLastPost: Ember.computed.equal(
    "selection",
    "set_based_on_last_post"
  ),
  displayDateAndTimePicker: Ember.computed.and("includeDateTime", "isCustom"),
  displayLabel: null,

  init() {
    this._super(...arguments);

    if (this.input) {
      if (this.basedOnLastPost) {
        this.set("selection", "set_based_on_last_post");
      } else {
        const datetime = moment(this.input);
        this.setProperties({
          selection: "pick_date_and_time",
          date: datetime.format("YYYY-MM-DD"),
          time: datetime.format("HH:mm")
        });
        this._updateInput();
      }
    }
  },

  @observes("date", "time")
  _updateInput() {
    if (!this.date) {
      this.set("time", null);
    }

    const time = this.time ? ` ${this.time}` : "";
    const dateTime = moment(`${this.date}${time}`);

    if (dateTime.isValid()) {
      this.set("input", dateTime.format(FORMAT));
    } else {
      this.set("input", null);
    }
  },

  @observes("isBasedOnLastPost")
  _updateBasedOnLastPost() {
    this.set("basedOnLastPost", this.isBasedOnLastPost);
  },

  @computed("input", "isBasedOnLastPost")
  duration(input, isBasedOnLastPost) {
    const now = moment();

    if (isBasedOnLastPost) {
      return parseFloat(input);
    } else {
      return moment(input) - now;
    }
  },

  @computed("input", "isBasedOnLastPost")
  executeAt(input, isBasedOnLastPost) {
    if (isBasedOnLastPost) {
      return moment()
        .add(input, "hours")
        .format(FORMAT);
    } else {
      return input;
    }
  },

  didReceiveAttrs() {
    this._super(...arguments);

    if (this.label) this.set("displayLabel", I18n.t(this.label));
  },

  @computed(
    "statusType",
    "input",
    "isCustom",
    "date",
    "time",
    "willCloseImmediately",
    "categoryId"
  )
  showTopicStatusInfo(
    statusType,
    input,
    isCustom,
    date,
    time,
    willCloseImmediately,
    categoryId
  ) {
    if (!statusType || willCloseImmediately) return false;

    if (
      statusType === PUBLISH_TO_CATEGORY_STATUS_TYPE &&
      Ember.isEmpty(categoryId)
    ) {
      return false;
    }

    if (isCustom) {
      return date || time;
    } else {
      return input;
    }
  },

  @computed("isBasedOnLastPost", "input", "lastPostedAt")
  willCloseImmediately(isBasedOnLastPost, input, lastPostedAt) {
    if (isBasedOnLastPost && input) {
      let closeDate = moment(lastPostedAt);
      closeDate = closeDate.add(input, "hours");
      return closeDate < moment();
    }
  },

  @computed("isBasedOnLastPost", "lastPostedAt")
  willCloseI18n(isBasedOnLastPost, lastPostedAt) {
    if (isBasedOnLastPost) {
      const diff = Math.round(
        (new Date() - new Date(lastPostedAt)) / (1000 * 60 * 60)
      );
      return I18n.t("topic.auto_close_immediate", { count: diff });
    }
  }
});
