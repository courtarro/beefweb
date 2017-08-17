#include "static_controller.hpp"
#include "file_system.hpp"
#include "content_type_map.hpp"
#include "router.hpp"
#include "settings.hpp"

namespace msrv {

StaticController::StaticController(
    Request* request, SettingsStore* store, const ContentTypeMap* ctmap)
    : ControllerBase(request), store_(store), ctmap_(ctmap)
{
}

StaticController::~StaticController()
{
}

ResponsePtr StaticController::getFile()
{
    const auto& staticDir = store_->settings().staticDir;
    if (staticDir.empty())
        return Response::error(HttpStatus::S_404_NOT_FOUND);

    std::string path = request()->path;

    if (!path.empty() && path.back() == '/')
        path += "index.html";

    auto filePath = pathFromUtf8(staticDir) / pathFromUtf8(path);
    auto file = openFile(filePath);
    if (!file)
        return Response::error(HttpStatus::S_404_NOT_FOUND);

    return Response::file(std::move(file), ctmap_->get(filePath));
}

void StaticController::defineRoutes(Router* router, SettingsStore* store, const ContentTypeMap* ctmap)
{
    auto routes = router->defineRoutes<StaticController>();

    routes.createWith([=](Request* request)
    {
        return new StaticController(request, store, ctmap);
    });

    routes.get("", &StaticController::getFile);
    routes.get(":path*", &StaticController::getFile);
}

}