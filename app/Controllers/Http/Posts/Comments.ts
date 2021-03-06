import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { Post, Comment } from 'App/Models'
import { StoreValidator, UpdateValidator } from 'App/Validators/Post/Comments'

export default class PostCommentsController {
  public async store({ request, auth }: HttpContextContract) {
    const { content, postId } = await request.validate(StoreValidator)
    const post = await Post.findOrFail(postId)
    const comment = await post.related('comments').create({ content, userId: auth.user!.id })
    return comment
  }

  public async update({ request, response, auth, params }: HttpContextContract) {
    const content = await request.validate(UpdateValidator)
    const comment = await Comment.findOrFail(params.id)
    if (auth.user!.id !== comment.userId) {
      return response.unauthorized()
    }
    await comment.merge(content).save()
    return comment
  }

  public async destroy({ auth, params, response }: HttpContextContract) {
    const comment = await Comment.findOrFail(params.id)
    if (auth.user!.id !== comment.userId) {
      return response.unauthorized()
    }
    await comment.delete()
  }
}
