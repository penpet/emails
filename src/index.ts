import env from 'dotenv'

env.config()

import { config } from 'aws-sdk'
import getHtml from 'mjml'
import { minify as minifyHtml } from 'html-minifier'
import { load as loadHtml } from 'cheerio'
import { htmlToText } from 'html-to-text'
import { join } from 'path'

if (!(config.region = process.env.AWS_REGION))
	throw new Error('Missing AWS region')

import { readFolder, readFile, uploadTemplate, sleep } from './utils'
import { TEMPLATES } from './constants'

const main = async () => {
	const paths = await readFolder(TEMPLATES)

	for (let i = 0; i < paths.length; i++) {
		process.stdout.write(`Uploading template #${i + 1}...`)

		const path = paths[i]

		const name = path.match(/^(.+)\.mjml$/)?.[1]
		if (!name) throw new Error('Missing name')

		const html = minifyHtml(
			getHtml(await readFile(join(TEMPLATES, path)), {
				validationLevel: 'strict'
			}).html,
			{
				collapseWhitespace: true,
				minifyCSS: true,
				minifyJS: true
			}
		)

		const subject = loadHtml(html)('title').text()
		if (!subject) throw new Error('Missing subject')

		await uploadTemplate({
			TemplateName: name,
			SubjectPart: subject,
			HtmlPart: html,
			TextPart: htmlToText(html)
		})

		process.stdout.write(' DONE\n')

		await sleep(1000)
	}
}

main()
