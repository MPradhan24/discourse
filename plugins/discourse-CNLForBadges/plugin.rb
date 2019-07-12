# name: DiscourseCNLForBadges
# about:
# version: 0.1
# authors: Sheth-Smit
# url: https://github.com/MPradhan24/discourse-CNL-For-Badges


register_asset "stylesheets/common/discourse-CNLForBadges.scss"


enabled_site_setting :discourse_CNLForBadges_enabled

PLUGIN_NAME ||= "DiscourseCNLForBadges".freeze

after_initialize do
  
  # see lib/plugin/instance.rb for the methods available in this context
  

  module ::DiscourseCNLForBadges
    class Engine < ::Rails::Engine
      engine_name PLUGIN_NAME
      isolate_namespace DiscourseCNLForBadges
    end
  end

  
  class DiscourseCNLForBadges::Queries
    attr_accessor :id, :cnl

    def initialize
      @cnl = 'SELECT'
    end

  end

  
  require_dependency "application_controller"
  class DiscourseCNLForBadges::ActionsController < ::ApplicationController
    requires_plugin PLUGIN_NAME

    before_action :ensure_logged_in

    def list
      render json: success_json
    end
  end

  DiscourseCNLForBadges::Engine.routes.draw do
    get "/list" => "actions#list"
  end

  Discourse::Application.routes.append do
    mount ::DiscourseCNLForBadges::Engine, at: "/discourse-CNLForBadges"
  end
  
end
