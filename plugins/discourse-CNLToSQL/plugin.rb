# name: DiscourseCNLToSQL
# about:
# version: 0.1
# authors: Sheth-Smit
# url: https://github.com/Sheth-Smit


register_asset "stylesheets/common/discourse-CNLToSQL.scss"


enabled_site_setting :discourse_CNLToSQL_enabled

PLUGIN_NAME ||= "DiscourseCNLToSQL".freeze

after_initialize do
  
  # see lib/plugin/instance.rb for the methods available in this context
  

  module ::DiscourseCNLToSQL
    class Engine < ::Rails::Engine
      engine_name PLUGIN_NAME
      isolate_namespace DiscourseCNLToSQL
    end
  end

  

  
  require_dependency "application_controller"
  class DiscourseCNLToSQL::ActionsController < ::ApplicationController
    requires_plugin PLUGIN_NAME

    before_action :ensure_logged_in

    def list
      render json: success_json
    end
  end

  DiscourseCNLToSQL::Engine.routes.draw do
    get "/list" => "actions#list"
  end

  Discourse::Application.routes.append do
    mount ::DiscourseCNLToSQL::Engine, at: "/discourse-CNLToSQL"
  end
  
end
